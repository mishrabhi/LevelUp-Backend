#!/usr/bin/env node

/**
 * REMOVE OLD DUPLICATE USERS SCRIPT
 * 
 * Problem: You have duplicate Raj Kumar users with different ObjectIDs
 * Old ID: 6973310da0a2e920e7795abd
 * New ID: 697336072faa77d142552898
 * 
 * Solution: Delete the old one, keep only the new one
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

dotenv.config();

const run = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/levelup';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUrl);
    console.log('✓ Connected\n');

    // Get all students
    const students = await User.find({ role: 'Student' });
    console.log(`Found ${students.length} students\n`);

    // Group by email to find duplicates
    const emailMap = {};
    students.forEach(student => {
      if (!emailMap[student.email]) {
        emailMap[student.email] = [];
      }
      emailMap[student.email].push(student);
    });

    // Find and delete duplicates
    let deletedCount = 0;
    for (const [email, users] of Object.entries(emailMap)) {
      if (users.length > 1) {
        console.log(`⚠️  Duplicate found: ${email} (${users.length} users)`);
        
        // Sort by creation date, keep newest
        users.sort((a, b) => b.createdAt - a.createdAt);
        const keepUser = users[0];
        const deleteUsers = users.slice(1);

        console.log(`   Keep: ${keepUser._id.toString()} (${keepUser.createdAt})`);
        
        for (const oldUser of deleteUsers) {
          console.log(`   Delete: ${oldUser._id.toString()} (${oldUser.createdAt})`);
          
          // Delete applications by old user
          const appCount = await Application.deleteMany({ studentId: oldUser._id });
          console.log(`     - Deleted ${appCount.deletedCount} applications`);
          
          // Delete the user
          await User.deleteOne({ _id: oldUser._id });
          console.log(`     - User deleted`);
          
          deletedCount++;
        }
        console.log('');
      }
    }

    if (deletedCount === 0) {
      console.log('✓ No duplicates found\n');
    } else {
      console.log(`✓ Deleted ${deletedCount} duplicate user(s)\n`);
    }

    // Show remaining students
    console.log('========== REMAINING STUDENTS ==========\n');
    const finalStudents = await User.find({ role: 'Student' }).sort({ createdAt: 1 });
    
    finalStudents.forEach(student => {
      console.log(`${student.name}`);
      console.log(`  ID: ${student._id.toString()}`);
      console.log(`  Email: ${student.email}`);
      console.log(`  Campus: ${student.campus}`);
      console.log('');
    });

    console.log('========== JOBS WITH ALLOWED STUDENTS ==========\n');
    const jobs = await Job.find({}).populate('allowedStudents', 'name email');
    
    jobs.forEach(job => {
      console.log(`${job.jobTitle} at ${job.companyName}`);
      console.log(`  Allowed Students (${job.allowedStudents.length}):`);
      job.allowedStudents.forEach(student => {
        console.log(`    - ${student.name} (${student._id})`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Done');
  }
};

run();
