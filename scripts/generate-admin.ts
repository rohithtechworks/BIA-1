import { supabaseAdmin } from '../server/services/supabase.js';
import { normalizePhoneNumber } from '../server/utils/phoneUtils.js';
import { courseCodeService } from '../server/services/courseCodeService.js';
import dotenv from 'dotenv';
dotenv.config();

async function createAdmin() {
  const phone = process.env.INITIAL_ADMIN_PHONE || '+919876543210';
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'AdminPassword123!';
  const fullName = 'HSC System Admin';

  const normalizedPhone = normalizePhoneNumber(phone);
  const syntheticEmail = `${normalizedPhone.replace('+', '')}@homespokencentre.internal`;

  console.log(`Setting up initial administrator for phone: ${normalizedPhone}...`);

  // Check existing profile
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('phone_number', normalizedPhone)
    .maybeSingle();

  if (existing) {
    console.log('Admin user already exists with ID:', existing.id);
    return;
  }

  // Create auth user
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: syntheticEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone_number: normalizedPhone }
  });

  if (authErr || !authData.user) {
    console.error('Error creating admin auth user:', authErr);
    return;
  }

  // Insert profile with role = 'admin'
  const { error: profErr } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    full_name: fullName,
    phone_number: normalizedPhone,
    role: 'admin'
  });

  if (profErr) {
    console.error('Error inserting admin profile:', profErr);
    return;
  }

  console.log('Admin user profile created successfully!');

  // Generate initial test course access code
  const initialCode = await courseCodeService.generateCode('home-spoken-english', authData.user.id, 'HSC-DEMO-2025');
  console.log('Initial Course Access Code generated:', initialCode.code);
}

createAdmin().catch(console.error);
