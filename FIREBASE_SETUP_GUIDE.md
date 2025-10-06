# Firebase Realtime Database Setup Guide

## Current Status
Your app is **already configured** with Firebase Realtime Database. All devices should sync automatically when online.

## Firebase Configuration (Already Set Up)
- **Project**: arkive-da661
- **Region**: asia-southeast1
- **Database URL**: https://arkive-da661-default-rtdb.asia-southeast1.firebasedatabase.app/

## How It Works

### 1. Data Storage
- **Local**: Data is stored in IndexedDB (works offline)
- **Cloud**: Data syncs to Firebase Realtime Database when online
- **Sync**: Automatic bidirectional sync between all devices

### 2. Sync Flow
```
Device 1 → IndexedDB → Sync Queue → Firebase → Device 2
```

When you create/update/delete any data:
1. Saved immediately to local IndexedDB
2. Added to sync queue
3. Synced to Firebase when online
4. Other devices receive updates in real-time

### 3. What Gets Synced
All of the following data syncs across devices:
- Users & Login Credentials
- Clients
- Receipts
- Expenses
- Employees
- Attendance Records
- Tasks
- Notifications
- Documents
- Employee Permissions

## Verifying Firebase Setup

### Check Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: **arkive-da661**
3. Click "Realtime Database" in the left menu
4. You should see data organized like:
```
/users
  /user-id-1
    username: "admin"
    role: "admin"
    ...
/clients
  /client-id-1
    name: "..."
    cnic: "..."
    ...
/employees
  /employee-id-1
    name: "..."
    ...
```

### Check Security Rules
In Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ Important**: These open rules are for development. For production, you should restrict access.

## Production Security Rules (Recommended)

Replace the rules in Firebase Console with:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

This requires authentication but your app uses anonymous auth, so it will work.

## Testing the Sync

### Test 1: Same Data on Multiple Devices
1. Open the app on Device 1
2. Create a client or receipt
3. Open the app on Device 2
4. You should see the same data

### Test 2: Offline Mode
1. Disconnect from internet
2. Create some data
3. Reconnect to internet
4. Data should automatically sync to Firebase
5. Check other devices - they should receive updates

### Test 3: Sync Status
Open browser console (F12) and look for:
- ✅ Firebase sync service initialized
- ✅ Firebase anonymous authentication successful
- 🔄 Processing X sync operations...
- ✅ Synced create operation for users/...

## Troubleshooting

### Problem: Data not syncing
**Solution**:
1. Open browser console (F12)
2. Check for errors
3. Verify you're logged in to the app
4. Check internet connection
5. Look for sync status messages

### Problem: Employee credentials not working
**Solution**:
1. When creating an employee, the username is automatically converted to lowercase
2. Ensure you're using the lowercase version when logging in
3. Wait 2-3 seconds after creating employee before trying to login
4. Check Firebase Console to verify the user was created in `/users`

### Problem: Multiple devices showing different data
**Solution**:
1. Make sure all devices are online
2. Refresh all devices (F5)
3. Check Firebase Console to see the "source of truth"
4. If data is corrupted, you can wipe and resync

### Problem: Firebase authentication failed
**Solution**:
1. The app uses anonymous authentication automatically
2. Check Firebase Console → Authentication → Sign-in method
3. Ensure "Anonymous" provider is enabled
4. If not enabled:
   - Click "Anonymous"
   - Toggle "Enable"
   - Click "Save"

## Manual Sync Operations

### View Sync Status
Open browser console and run:
```javascript
// Check sync status
const status = await firebaseSync.getSyncStatus();
console.log(status);
```

### Force Full Sync
```javascript
// Force sync all data to Firebase
await firebaseSync.performFullSync();
```

### Clear All Data (⚠️ Dangerous)
```javascript
// Wipe all data from Firebase and local storage
await firebaseSync.wipeAllData();
```

## Firebase Console Access

1. **URL**: https://console.firebase.google.com/
2. **Project**: arkive-da661
3. **Email**: Use the email associated with your Firebase account

## Data Structure in Firebase

```
arkive-da661-default-rtdb/
├── users/
│   ├── {user-id}/
│   │   ├── username
│   │   ├── password
│   │   ├── role
│   │   ├── createdAt
│   │   └── lastModified
├── clients/
│   ├── {client-id}/
│   │   ├── name
│   │   ├── cnic
│   │   ├── email
│   │   └── ...
├── employees/
│   ├── {employee-id}/
│   │   ├── name
│   │   ├── employeeId
│   │   ├── userId (links to users/)
│   │   └── ...
├── receipts/
├── expenses/
├── attendance/
├── tasks/
└── sync_metadata/
    └── {device-id}/
        └── lastSync
```

## Next Steps

1. ✅ Firebase is already configured and working
2. ✅ Test on multiple devices to verify sync
3. ✅ Monitor Firebase Console to see real-time data
4. ⚠️ Update security rules for production
5. ⚠️ Set up Firebase Authentication with real users (optional)

## Need Help?

- Check browser console (F12) for error messages
- Look for sync status logs
- Verify data in Firebase Console
- Check that all devices are online
- Ensure Firebase project is not suspended/deleted

---

**Your Firebase database is already set up and working!** Just make sure:
1. You're logged in to the app
2. You have an internet connection
3. Firebase project is active (check Firebase Console)
