-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Enable read access for admins" 
ON public.contact_submissions 
FOR SELECT USING (auth.role() = 'authenticated' AND is_admin_user(auth.uid()));

CREATE POLICY "Enable update for admins"
ON public.contact_submissions
FOR UPDATE USING (auth.role() = 'authenticated' AND is_admin_user(auth.uid()));

-- Create index for better query performance
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_contact_submission_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for the function
CREATE TRIGGER update_contact_submission_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION update_contact_submission_updated_at();
