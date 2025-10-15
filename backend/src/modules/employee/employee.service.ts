import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Experience } from '../../common/interfaces/employee.interface';
import { EmployeeStatus, MaritalStatus } from '../../../generated/prisma';
import { deleteFile } from '../../common/utils/file-upload.utils';
import { EmailService } from 'src/global/email/email.service';
import { generatePassword } from 'src/common/utils/GeneratePassword.utils';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async create(data: {
    first_name: string;
    last_name: string;
    gender: string;
    date_of_birth: Date;
    phone: string;
    email: string;
    address: string;
    national_id: string;
    profile_picture?: string;
    cv?: string;
    application_letter?: string;
    position: string;
    departmentId: string;
    marital_status?: MaritalStatus;
    date_hired: Date;
    status?: EmployeeStatus;
    bank_account_number?: string;
    bank_name?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    experience?: any[];
  }) {
    // 🔍 Check if employee exists by phone, email, or national_id
    const existingEmployee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          { email: data.email },
          { national_id: data.national_id },
        ],
      },
    });

    if (existingEmployee) {
      throw new ConflictException(
        'Employee already exists with provided phone, email, or national ID',
      );
    }

    const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);
    
    data['password'] = hashedPassword;
    // ✅ Create new employee
    const createdEmployee = await this.prisma.employee.create({
      data: {
        ...data,
        experience: data.experience || [],
        marital_status: data.marital_status || MaritalStatus.SINGLE,
        status: data.status || EmployeeStatus.ACTIVE,
      },
      include: {
        department: true,
      },
    });

    const currentYear = new Date().getFullYear();
    await this.email.sendEmail(
      String(createdEmployee.email),
      'Welcome to the Company',
      'Employee-registration-success',
      {
        firstname: createdEmployee.first_name,
        lastname: createdEmployee.last_name,
        password: password,
        email: createdEmployee.email,
        year: currentYear,
      },
    );

    return createdEmployee;
  }

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        department: true,
        contract: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
       contract: true
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

async update(
  id: string,
  data: {
    first_name?: string;
    last_name?: string;
    gender?: string;
    date_of_birth?: Date;
    phone?: string;
    email?: string;
    address?: string;
    national_id?: string;
    profile_picture?: string;
    cv?: string;
    application_letter?: string;
    position?: string;
    departmentId?: string;
    marital_status?: MaritalStatus;
    date_hired?: Date;
    status?: EmployeeStatus;
    experience?: any;
    bank_account_number?: string;
    bank_name?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    password?: string;
    google_id?: string;
    isLocked?: boolean;
    is2FA?: boolean;
  },
) {
  const employee = await this.findOne(id);
  if (!employee) throw new Error('Employee not found');

  // Handle file deletion for replaced files
  if (data.profile_picture && employee.profile_picture) {
    try { deleteFile(employee.profile_picture); } catch (error) { console.error('Error deleting profile picture:', error); }
  }
  if (data.cv && employee.cv) {
    try { deleteFile(employee.cv); } catch (error) { console.error('Error deleting CV:', error); }
  }
  if (data.application_letter && employee.application_letter) {
    try { deleteFile(employee.application_letter); } catch (error) { console.error('Error deleting application letter:', error); }
  }

  return this.prisma.employee.update({
    where: { id },
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      gender: data.gender,
      date_of_birth: data.date_of_birth,
      phone: data.phone,
      email: data.email,
      address: data.address,
      national_id: data.national_id,
      profile_picture: data.profile_picture,
      cv: data.cv,
      application_letter: data.application_letter,
      position: data.position,
      marital_status: data.marital_status,
      date_hired: data.date_hired,
      status: data.status,
      experience: data.experience !== undefined ? data.experience : employee.experience,
      bank_account_number: data.bank_account_number,
      bank_name: data.bank_name,
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_phone: data.emergency_contact_phone,
      password: data.password,
      google_id: data.google_id,
      isLocked: typeof data.isLocked == 'string' ? JSON.parse(data.isLocked) : data.isLocked,
      is2FA: typeof data.is2FA == 'string' ? JSON.parse(data.is2FA) : data.is2FA ,
      department: data.departmentId ? { connect: { id: data.departmentId } } : undefined,
    },
    include: { department: true },
  });
}

  async remove(id: string) {
    const employee = await this.findOne(id);

    // Delete associated files before removing employee record
    if (employee.profile_picture) {
      try {
        deleteFile(employee.profile_picture);
      } catch (error) {
        console.error('Error deleting profile picture:', error);
      }
    }

    if (employee.cv) {
      try {
        deleteFile(employee.cv);
      } catch (error) {
        console.error('Error deleting CV:', error);
      }
    }

    if (employee.application_letter) {
      try {
        deleteFile(employee.application_letter);
      } catch (error) {
        console.error('Error deleting application letter:', error);
      }
    }

    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
