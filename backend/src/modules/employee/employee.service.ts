import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { EmployeeStatus } from '../../../generated/prisma';
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
    first_name?: string;
    last_name?: string;
    gender?: string;
    phone?: string;
    email: string;
    national_id?: string;
    profile_picture?: string;
    position?: string;
    department?: string;
    date_hired?: Date;
    status?: EmployeeStatus;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    adminId: string;
  }) {
    // 🔍 Check if employee exists by email or national_id
    const existingEmployee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.national_id ? [{ national_id: data.national_id }] : []),
        ],
      },
    });

    if (existingEmployee) {
      throw new ConflictException(
        'Employee already exists with provided email or national ID',
      );
    }

    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new employee
    const createdEmployee = await this.prisma.employee.create({
      data: {
        ...data,
        password: hashedPassword,
        status: data.status || EmployeeStatus.ACTIVE,
      },
    });

    // Get admin (company) info for the email
    const admin = await this.prisma.admin.findUnique({
      where: { id: data.adminId },
    });

    const currentYear = new Date().getFullYear();
    const loginUrl = process.env.FRONTEND_URL || 'https://app.mysystem.rw';

    await this.email.sendEmail(
      String(createdEmployee.email),
      'MySystem Access – Staff Account Created',
      'Staff-Account-Created',
      {
        staffName: `${createdEmployee.first_name || ''} ${createdEmployee.last_name || ''}`.trim() || 'Staff Member',
        businessName: admin?.adminName || 'Your Company',
        loginUrl: loginUrl,
        email: createdEmployee.email,
        password: password,
        year: currentYear,
      },
    );

    return createdEmployee;
  }

  async findAll(adminId: string) {
    return this.prisma.employee.findMany({
      where: {
        adminId,
      },
      include: {
        admin: true,
        contract: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        contract: true,
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
      phone?: string;
      email?: string;
      national_id?: string;
      profile_picture?: string;
      position?: string;
      department?: string;
      date_hired?: Date;
      status?: EmployeeStatus;
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
      try {
        deleteFile(employee.profile_picture);
      } catch (error) {
        console.error('Error deleting profile picture:', error);
      }
    }

    return this.prisma.employee.update({
      where: { id },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        national_id: data.national_id,
        profile_picture: data.profile_picture,
        position: data.position,
        department: data.department,
        date_hired: data.date_hired,
        status: data.status,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        password: data.password,
        google_id: data.google_id,
        isLocked:
          typeof data.isLocked == 'string'
            ? JSON.parse(data.isLocked)
            : data.isLocked,
        is2FA:
          typeof data.is2FA == 'string' ? JSON.parse(data.is2FA) : data.is2FA,
      },
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

    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
