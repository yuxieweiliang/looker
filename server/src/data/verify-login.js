/**
 * 用户登录验证脚本
 * 验证 account.json 中的账号能否正常登录
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// 加载账号信息
const accountPath = path.join(__dirname, '../../account.json');
const accounts = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));

// 模拟数据库中的密码哈希（从 seed-data.sql 中提取）
const dbPasswordHashes = {
  'user-001': '$2a$10$Q.JXQLaTTIw3aGv9zmYzMeJ6v6LenZr8AdTB/zepEq3/87kp30b/q',
  'user-002': '$2a$10$CSodgBkZ5E3P2pvwHjWEE.TCWerd8mk3DaLNAz.ZWNxAOdzXnLdIC',
  'user-003': '$2a$10$o.f.m4QxuX39m.EH2tBgiejTRJE0Ni/pqk/EOdTSVZ36gwoI/09eW',
  'user-004': '$2a$10$5qgqzeywfFZEbF9L42mv0e/Dkzdl89goSk1WhuXYxEWE8e5eyd1Vm',
  'user-005': '$2a$10$Wp4T4L1vuZBUOnE6WTAIie7cMXyLcUHDxy3k7yE1fE7uz4erV7Xly',
  'user-006': '$2a$10$/C3DAUNdbIiqGdyBts0olOzgbIyMDpKXqnS3M7xF66kBoLwR28mu.',
  'user-007': '$2a$10$TgjL2kqCdmojZw3b8DJkoe2ev7vvO2zgAyfe061o28HyMP0Kvvrae',
  'user-008': '$2a$10$se4rtewDWyWjX/oneug32eBNU23ABnKhr9O340qpZ07Yqq0m0uR7W',
};

async function verifyLogin() {
  console.log('=================================');
  console.log('🔐 Looker 用户登录验证');
  console.log('=================================\n');

  let passed = 0;
  let failed = 0;

  for (const account of accounts.accounts) {
    const passwordHash = dbPasswordHashes[account.userId];
    if (!passwordHash) {
      console.log(`❌ ${account.name} (${account.phone}): 未找到密码哈希`);
      failed++;
      continue;
    }

    const isValid = await bcrypt.compare(account.password, passwordHash);
    if (isValid) {
      console.log(`✅ ${account.name} (${account.phone}): 验证通过`);
      console.log(`   密码: ${account.password}`);
      passed++;
    } else {
      console.log(`❌ ${account.name} (${account.phone}): 验证失败`);
      failed++;
    }
  }

  console.log('\n=================================');
  console.log(`📊 验证结果: ${passed} 通过, ${failed} 失败`);
  console.log('=================================');

  if (failed === 0) {
    console.log('\n✨ 所有账号验证通过！可以正常使用。');
  } else {
    console.log('\n⚠️ 部分账号验证失败，请检查密码哈希。');
    process.exit(1);
  }
}

verifyLogin();
