-- SecureMed Supabase Schema & Row Level Security (RLS) Policies

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile." ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Medical Records Table
CREATE TABLE medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  doctor TEXT,
  hospital TEXT,
  record_date DATE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own medical records." ON medical_records FOR ALL USING (auth.uid() = user_id);

-- 3. Medicine Reminders Table
CREATE TABLE medicine_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  reminder_times TEXT[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE medicine_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reminders." ON medicine_reminders FOR ALL USING (auth.uid() = user_id);

-- 4. Emergency Information Table (1:1 with user)
CREATE TABLE emergency_information (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  blood_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE emergency_information ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own emergency info." ON emergency_information FOR ALL USING (auth.uid() = user_id);

-- 5. Allergies Table
CREATE TABLE allergies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own allergies." ON allergies FOR ALL USING (auth.uid() = user_id);

-- 6. Medical Conditions Table
CREATE TABLE medical_conditions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own conditions." ON medical_conditions FOR ALL USING (auth.uid() = user_id);

-- 7. Emergency Contacts Table
CREATE TABLE emergency_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own contacts." ON emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- 8. Health Tracking Table
CREATE TABLE health_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tracking_date DATE NOT NULL,
  water_goal INTEGER DEFAULT 8,
  water_consumed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, tracking_date)
);
ALTER TABLE health_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own health tracking." ON health_tracking FOR ALL USING (auth.uid() = user_id);

-- 9. Chat Messages Table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own chat messages." ON chat_messages FOR ALL USING (auth.uid() = user_id);


-- Create Trigger for automatically creating a profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Supabase Storage Configuration
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-records', 'medical-records', false);
CREATE POLICY "Authenticated users can upload records" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'medical-records' AND auth.uid() = owner);
CREATE POLICY "Users can view own records" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'medical-records' AND auth.uid() = owner);
CREATE POLICY "Users can update own records" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'medical-records' AND auth.uid() = owner);
CREATE POLICY "Users can delete own records" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'medical-records' AND auth.uid() = owner);
