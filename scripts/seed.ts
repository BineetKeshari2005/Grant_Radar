import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding dummy opportunities...');

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const dummyData = [
    {
      title: 'Global Tech Women Scholarship 2026',
      organization: 'Women in Tech Foundation',
      category: 'scholarship',
      description: 'A full-ride scholarship for women pursuing computer science degrees. Includes mentorship and a summer internship.',
      application_link: 'https://example.com/apply1',
      source_url: 'https://example.com/source1',
      country: 'United States',
      region: 'North America',
      eligibility: 'Female undergraduate students in tech.',
      funding_amount: '$10,000',
      deadline: nextMonth.toISOString().split('T')[0],
      remote_type: 'in-person',
      women_founder_friendly: true,
      student_eligible: true,
      indian_applicant_eligible: true,
      tags: ['Tech', 'Women', 'Computer Science'],
      status: 'active'
    },
    {
      title: 'AI for Good Fellowship',
      organization: 'OpenAI Institute',
      category: 'fellowship',
      description: 'A 6-month fellowship for AI researchers building solutions for climate change.',
      application_link: 'https://example.com/apply2',
      source_url: 'https://example.com/source2',
      country: 'Global',
      region: 'Global',
      eligibility: 'Post-graduate researchers.',
      funding_amount: '$5,000/month',
      deadline: nextWeek.toISOString().split('T')[0],
      remote_type: 'remote',
      women_founder_friendly: false,
      student_eligible: false,
      indian_applicant_eligible: true,
      tags: ['AI', 'Climate', 'Research'],
      status: 'active'
    },
    {
      title: 'NextGen Innovators Grant',
      organization: 'Global Innovation Fund',
      category: 'grant',
      description: 'Equity-free grant for early-stage startups focused on sustainable energy.',
      application_link: 'https://example.com/apply3',
      source_url: 'https://example.com/source3',
      country: 'United Kingdom',
      region: 'Europe',
      eligibility: 'Startups with less than $1M in funding.',
      funding_amount: '£50,000',
      deadline: nextMonth.toISOString().split('T')[0],
      remote_type: 'hybrid',
      women_founder_friendly: true,
      student_eligible: false,
      indian_applicant_eligible: true,
      tags: ['Startup', 'Sustainability', 'Energy'],
      status: 'active'
    },
    {
      title: 'YC Startup Accelerator',
      organization: 'Y Combinator',
      category: 'accelerator',
      description: 'The world\'s most prestigious startup accelerator program.',
      application_link: 'https://example.com/apply4',
      source_url: 'https://example.com/source4',
      country: 'United States',
      region: 'North America',
      eligibility: 'Early stage startups.',
      funding_amount: '$500,000',
      deadline: '2026-12-31',
      remote_type: 'in-person',
      women_founder_friendly: false,
      student_eligible: false,
      indian_applicant_eligible: false,
      tags: ['Startup', 'Accelerator', 'Tech'],
      status: 'active'
    },
    {
      title: 'European Union Climate Grant',
      organization: 'EU Commission',
      category: 'grant',
      description: 'Large-scale grant for deployment of carbon capture technologies.',
      application_link: 'https://example.com/apply5',
      source_url: 'https://example.com/source5',
      country: 'Belgium',
      region: 'Europe',
      eligibility: 'EU-based companies.',
      funding_amount: '€2,000,000',
      deadline: nextMonth.toISOString().split('T')[0],
      remote_type: 'in-person',
      women_founder_friendly: false,
      student_eligible: false,
      indian_applicant_eligible: false,
      tags: ['Climate', 'EU', 'DeepTech'],
      status: 'active'
    },
    {
      title: 'Anita Borg Memorial Scholarship',
      organization: 'Google',
      category: 'scholarship',
      description: 'Scholarship encouraging women to excel in computing and technology.',
      application_link: 'https://example.com/apply6',
      source_url: 'https://example.com/source6',
      country: 'Global',
      region: 'Global',
      eligibility: 'Female undergraduate or graduate students.',
      funding_amount: '$10,000',
      deadline: nextWeek.toISOString().split('T')[0],
      remote_type: 'remote',
      women_founder_friendly: true,
      student_eligible: true,
      indian_applicant_eligible: true,
      tags: ['Tech', 'Women', 'Google'],
      status: 'active'
    },
    {
      title: 'TechCrunch Disrupt Hackathon',
      organization: 'TechCrunch',
      category: 'competition',
      description: 'A 48-hour coding competition to build innovative prototypes.',
      application_link: 'https://example.com/apply7',
      source_url: 'https://example.com/source7',
      country: 'United States',
      region: 'North America',
      eligibility: 'Open to everyone.',
      funding_amount: '$50,000 prize pool',
      deadline: nextWeek.toISOString().split('T')[0],
      remote_type: 'hybrid',
      women_founder_friendly: false,
      student_eligible: true,
      indian_applicant_eligible: false,
      tags: ['Hackathon', 'Coding', 'Startup'],
      status: 'active'
    },
    {
      title: 'Web Summit 2026 Alpha Program',
      organization: 'Web Summit',
      category: 'conference',
      description: 'Exhibit your early-stage startup to thousands of attendees and investors.',
      application_link: 'https://example.com/apply8',
      source_url: 'https://example.com/source8',
      country: 'Portugal',
      region: 'Europe',
      eligibility: 'Startups with less than $1M funding.',
      funding_amount: 'Free Exhibition Space',
      deadline: nextMonth.toISOString().split('T')[0],
      remote_type: 'in-person',
      women_founder_friendly: false,
      student_eligible: false,
      indian_applicant_eligible: true,
      tags: ['Conference', 'Networking', 'Startup'],
      status: 'active'
    },
    {
      title: 'AWS Activate Giveaway',
      organization: 'Amazon Web Services',
      category: 'giveaway',
      description: 'Free AWS credits for eligible startups.',
      application_link: 'https://example.com/apply9',
      source_url: 'https://example.com/source9',
      country: 'Global',
      region: 'Global',
      eligibility: 'Startups associated with an AWS partner.',
      funding_amount: 'Up to $100,000 in credits',
      deadline: '2026-12-31',
      remote_type: 'remote',
      women_founder_friendly: false,
      student_eligible: false,
      indian_applicant_eligible: true,
      tags: ['Cloud', 'AWS', 'Credits'],
      status: 'active'
    },
    {
      title: 'Rhodes Scholarship',
      organization: 'Rhodes Trust',
      category: 'scholarship',
      description: 'Fully funded postgraduate award for study at the University of Oxford.',
      application_link: 'https://example.com/apply10',
      source_url: 'https://example.com/source10',
      country: 'United Kingdom',
      region: 'Europe',
      eligibility: 'Outstanding students globally.',
      funding_amount: 'Full tuition + stipend',
      deadline: nextMonth.toISOString().split('T')[0],
      remote_type: 'in-person',
      women_founder_friendly: false,
      student_eligible: true,
      indian_applicant_eligible: true,
      tags: ['Oxford', 'Postgraduate', 'Excellence'],
      status: 'active'
    },
    {
      title: 'Techstars London Accelerator',
      organization: 'Techstars',
      category: 'accelerator',
      description: '3-month mentorship-driven accelerator program.',
      application_link: 'https://example.com/apply11',
      source_url: 'https://example.com/source11',
      country: 'United Kingdom',
      region: 'Europe',
      eligibility: 'Tech startups.',
      funding_amount: '$120,000',
      deadline: nextWeek.toISOString().split('T')[0],
      remote_type: 'in-person',
      women_founder_friendly: false,
      student_eligible: false,
      indian_applicant_eligible: true,
      tags: ['Accelerator', 'London', 'Mentorship'],
      status: 'active'
    },
    {
      title: 'Kauffman Fellowship',
      organization: 'Kauffman Fellows',
      category: 'fellowship',
      description: 'A two-year venture capital fellowship program.',
      application_link: 'https://example.com/apply12',
      source_url: 'https://example.com/source12',
      country: 'United States',
      region: 'North America',
      eligibility: 'Venture capitalists and innovation leaders.',
      funding_amount: 'Networking & Curriculum',
      deadline: nextMonth.toISOString().split('T')[0],
      remote_type: 'hybrid',
      women_founder_friendly: true,
      student_eligible: false,
      indian_applicant_eligible: false,
      tags: ['Venture Capital', 'Fellowship', 'Leadership'],
      status: 'active'
    }
  ];

  const { data, error } = await supabase.from('opportunities').insert(dummyData);

  if (error) {
    console.error('Error inserting dummy data:', error);
  } else {
    console.log('Successfully inserted 12 dummy opportunities.');
  }
}

seed();
