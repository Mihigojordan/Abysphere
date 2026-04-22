# Mac System Data Cleanup Guide
## Safe Methods to Reduce Your 142 GB System Data

---

## ⚠️ IMPORTANT: Before You Start
- **Back up important data** (even though we're only deleting system caches/temp files)
- **Close all applications** before running cleanup commands
- These methods are safe and won't harm your system

---

## Method 1: Delete Time Machine Local Snapshots (Usually 20-60 GB)

### Check if you have snapshots:
```bash
tmutil listlocalsnapshots /
```

### Delete all local snapshots:
```bash
tmutil listlocalsnapshots / | grep "com.apple" | while read line; do sudo tmutil deletelocalsnapshots ${line:24}; done
```

**OR delete them one by one:**
```bash
sudo tmutil deletelocalsnapshots 2024-04-18-123456
```

---

## Method 2: Delete iOS Device Backups (Usually 10-40 GB per device)

### Option A - Using Finder (Easiest):
1. Open **Finder**
2. If you have an iPhone/iPad connected, click on it in the sidebar
3. Click **Manage Backups**
4. Select old backups and click **Delete Backup**

### Option B - Manual deletion:
1. Go to: `~/Library/Application Support/MobileSync/Backup/`
2. Delete folders of old backups you don't need
3. Empty Trash

**Location:** `~/Library/Application Support/MobileSync/Backup/`

---

## Method 3: Clear System Caches (Usually 5-20 GB)

### Clear user caches:
```bash
# View cache size first
du -sh ~/Library/Caches

# Clear user caches (safe to delete)
rm -rf ~/Library/Caches/*
```

### Clear system caches (requires admin password):
```bash
# View size
sudo du -sh /Library/Caches

# Clear system caches
sudo rm -rf /Library/Caches/*
```

**Note:** Apps will recreate necessary caches automatically

---

## Method 4: Clear Browser Caches (Usually 2-10 GB)

### Safari:
1. Safari → Settings → Privacy
2. Click **Manage Website Data**
3. Click **Remove All**

### Chrome:
1. Chrome → Settings → Privacy and Security
2. Click **Clear browsing data**
3. Select "Cached images and files"
4. Choose "All time" and click Clear

### Firefox:
1. Firefox → Settings → Privacy & Security
2. Under Cookies and Site Data, click **Clear Data**
3. Check "Cached Web Content" only

---

## Method 5: Clear Mail Downloads & Attachments (Usually 1-5 GB)

```bash
# Check size
du -sh ~/Library/Mail/V*/MailData/Envelope\ Index

# Clear mail downloads
rm -rf ~/Library/Mail Downloads/*
```

---

## Method 6: Clear System Log Files (Usually 1-5 GB)

```bash
# Check size
sudo du -sh /var/log

# Clear old logs (safe - system creates new ones)
sudo rm -rf /var/log/*.log
sudo rm -rf /var/log/*.gz
```

---

## Method 7: Remove Old iOS Software Updates (Usually 5-15 GB)

```bash
# Location of iOS updates
cd ~/Library/iTunes/iPhone\ Software\ Updates/
# Delete .ipsw files you don't need
rm *.ipsw
```

---

## Method 8: Clear Xcode Derived Data (For Developers - Usually 10-30 GB)

```bash
# Check size
du -sh ~/Library/Developer/Xcode/DerivedData

# Delete it (Xcode will rebuild when needed)
rm -rf ~/Library/Developer/Xcode/DerivedData
```

---

## Method 9: Empty Trash Completely

1. **Empty Trash normally**: Trash → Empty Trash
2. **Force empty if needed**:
```bash
sudo rm -rf ~/.Trash/*
```

---

## Method 10: Restart Your Mac

After cleaning, restart your Mac to:
- Release temporary files
- Clear RAM caches
- Finalize deletions

---

## Quick All-in-One Script

**⚠️ Review each command before running!**

```bash
#!/bin/bash

echo "Starting Mac cleanup..."

# 1. Clear user caches
echo "Clearing user caches..."
rm -rf ~/Library/Caches/*

# 2. Clear system caches
echo "Clearing system caches (requires password)..."
sudo rm -rf /Library/Caches/*

# 3. Clear log files
echo "Clearing logs..."
sudo rm -rf /var/log/*.log
sudo rm -rf /var/log/*.gz

# 4. Clear Mail downloads
echo "Clearing Mail downloads..."
rm -rf ~/Library/Mail\ Downloads/*

# 5. Clear Trash
echo "Emptying Trash..."
rm -rf ~/.Trash/*

# 6. Delete Time Machine snapshots
echo "Deleting Time Machine local snapshots..."
tmutil listlocalsnapshots / | grep "com.apple" | while read line; do sudo tmutil deletelocalsnapshots ${line:24}; done

echo "Cleanup complete! Please restart your Mac."
echo "Check storage: Apple menu → System Settings → General → Storage"
```

---

## What NOT to Delete

❌ **Don't delete:**
- Anything in `/System/` folder
- Anything in `/Library/Application Support/` (unless you know what it is)
- Your `~/Library/` folder itself
- Any `.app` files
- Database files (.db, .sqlite)

---

## Expected Results

After cleanup, you should see:
- **20-80 GB freed** from System Data
- System Data reduced to **60-90 GB** (normal range)
- Mac running faster
- More available storage

---

## Monitoring Storage After Cleanup

Check your progress:
1. **Apple menu**  → **System Settings**
2. Click **General** → **Storage**
3. Wait for it to recalculate (may take 5-10 minutes)

---

## Safe Third-Party Tools (Optional)

If you prefer GUI tools:
- **OnyX** (Free) - Comprehensive maintenance
- **CleanMyMac X** (Paid) - User-friendly cleaner
- **DaisyDisk** (Paid) - Visual storage analyzer

---

## Need More Help?

If System Data is still huge after these steps:
1. **Reinstall macOS** (preserves your files, cleans system thoroughly)
2. Use **DaisyDisk** or **GrandPerspective** to visualize what's taking space
3. Run First Aid in Disk Utility to check for errors

---

**Last Updated:** April 2026
**Safe for:** macOS Monterey, Ventura, Sonoma, and later versions
