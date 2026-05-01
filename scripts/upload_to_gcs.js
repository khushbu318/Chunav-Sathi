#!/usr/bin/env node

/**
 * Upload Constituencies to Google Cloud Storage
 * Makes data accessible from anywhere with CDN speeds
 * 
 * Prerequisites:
 * 1. Install gcloud CLI: https://cloud.google.com/sdk/docs/install
 * 2. Authenticate: gcloud auth login
 * 3. Set project: gcloud config set project YOUR_PROJECT_ID
 * 
 * Usage: node scripts/upload_to_gcs.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

const GCS_BUCKET = 'chunav-sathi-data'; // Change this to your bucket name
const LOCAL_FILE = path.join(__dirname, '../public/data/all_constituencies.json');
const GCS_FILE = 'constituencies/all_constituencies.json';

/**
 * Check if file exists
 */
function checkFile() {
  if (!fs.existsSync(LOCAL_FILE)) {
    console.error('❌ File not found:', LOCAL_FILE);
    console.log('💡 Run this first: node scripts/process_constituencies.js');
    process.exit(1);
  }
  
  const stats = fs.statSync(LOCAL_FILE);
  console.log(`📄 File: ${LOCAL_FILE}`);
  console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
}

/**
 * Check gcloud is installed
 */
async function checkGCloud() {
  try {
    const { stdout } = await execAsync('gcloud --version');
    console.log('✅ gcloud CLI found');
    return true;
  } catch (error) {
    console.error('❌ gcloud CLI not found');
    console.log('📥 Install it from: https://cloud.google.com/sdk/docs/install\n');
    return false;
  }
}

/**
 * Check authentication
 */
async function checkAuth() {
  try {
    await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"');
    console.log('✅ gcloud authenticated');
    return true;
  } catch (error) {
    console.error('❌ Not authenticated with gcloud');
    console.log('🔐 Run: gcloud auth login\n');
    return false;
  }
}

/**
 * Check project is set
 */
async function checkProject() {
  try {
    const { stdout } = await execAsync('gcloud config get-value project');
    const project = stdout.trim();
    
    if (!project) {
      console.error('❌ No GCP project set');
      console.log('⚙️  Set project: gcloud config set project YOUR_PROJECT_ID\n');
      return false;
    }
    
    console.log(`✅ Project: ${project}`);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Create GCS bucket if it doesn't exist
 */
async function createBucketIfNeeded() {
  try {
    console.log(`\n🪣 Checking bucket: ${GCS_BUCKET}`);
    await execAsync(`gsutil ls gs://${GCS_BUCKET}`);
    console.log('✅ Bucket exists');
    return true;
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.log('📍 Creating bucket...');
      try {
        await execAsync(`gsutil mb gs://${GCS_BUCKET}`);
        console.log(`✅ Bucket created: ${GCS_BUCKET}`);
        return true;
      } catch (createError) {
        console.error('❌ Failed to create bucket:', createError.message);
        return false;
      }
    }
    throw error;
  }
}

/**
 * Upload file to GCS
 */
async function uploadFile() {
  try {
    console.log(`\n📤 Uploading to gs://${GCS_BUCKET}/${GCS_FILE}`);
    
    await execAsync(
      `gsutil -h "Cache-Control:public, max-age=3600" cp "${LOCAL_FILE}" gs://${GCS_BUCKET}/${GCS_FILE}`
    );
    
    console.log('✅ Upload complete');
    return true;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    return false;
  }
}

/**
 * Make file public
 */
async function makePublic() {
  try {
    console.log('🔓 Making file public...');
    
    await execAsync(
      `gsutil acl ch -u AllUsers:R gs://${GCS_BUCKET}/${GCS_FILE}`
    );
    
    console.log('✅ File is now public');
    return true;
  } catch (error) {
    console.error('❌ Failed to make public:', error.message);
    return false;
  }
}

/**
 * Get public URL
 */
function getPublicUrl() {
  return `https://storage.googleapis.com/${GCS_BUCKET}/${GCS_FILE}`;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 GCS Upload Tool');
    console.log('==================\n');

    // Check file
    checkFile();

    // Check tools
    if (!await checkGCloud()) process.exit(1);
    if (!await checkAuth()) process.exit(1);
    if (!await checkProject()) process.exit(1);

    // Create bucket
    if (!await createBucketIfNeeded()) process.exit(1);

    // Upload
    if (!await uploadFile()) process.exit(1);

    // Make public
    if (!await makePublic()) process.exit(1);

    // Show results
    const url = getPublicUrl();
    console.log('\n✅ Success!\n');
    console.log('📍 Public URL:');
    console.log(`   ${url}\n`);

    console.log('📝 To use in your React app:\n');
    console.log('```typescript');
    console.log("const response = await fetch(");
    console.log(`  '${url}'`);
    console.log(');');
    console.log('const data = await response.json();');
    console.log('```\n');

    console.log('💾 Or update in code:\n');
    console.log('```typescript');
    console.log('// src/components/features/map/index.tsx');
    console.log('const response = await fetch(');
    console.log(`  '${url}'`);
    console.log(');');
    console.log('const data = await response.json();');
    console.log('setConstituencies(data);');
    console.log('```');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
main();
