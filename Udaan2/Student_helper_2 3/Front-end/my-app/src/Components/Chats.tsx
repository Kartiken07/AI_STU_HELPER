import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, User, GraduationCap, Briefcase, BookOpen, X, DollarSign, FileText, Clock } from 'lucide-react';
import { API, apiGet } from '../api/config';
import { ChatSkeleton } from './Skeleton';

interface CareerDetails {
  salary: string;
  exams: string[];
  duration: string;
  skills: string[];
  description: string;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'root' | 'stream' | 'degree' | 'career';
  children?: TreeNode[];
  description?: string;
  details?: CareerDetails;
  x?: number;
  y?: number;
  level?: number;
}

interface ExpandedState {
  [key: string]: boolean;
}

const defaultCareerTreeData: TreeNode = {
  id: '1',
  name: '10th Pass',
  type: 'root',
  description: '',
  children: [
    {
      id: '2',
      name: 'Science Stream (11th)',
      type: 'stream',
      description: '',
      children: [
        {
          id: '2.1',
          name: 'PCM (Physics, Chemistry, Maths)',
          type: 'degree',
          children: [
            {
              id: '2.1.1',
              name: 'Engineering',
              type: 'degree',
              children: [
                { 
                  id: '2.1.1.1', 
                  name: 'Software Developer', 
                  type: 'career', 
                  description: 'Develop software applications and systems',
                  details: {
                    salary: '₹6-25 LPA',
                    exams: ['JEE Main', 'JEE Advanced', 'GATE', 'Company Coding Tests'],
                    duration: '4 years B.Tech + Experience',
                    skills: ['Programming', 'Problem Solving', 'Data Structures', 'Algorithms'],
                    description: 'Design, develop, and maintain software applications. Work with various programming languages and frameworks to create solutions for businesses and consumers.'
                  }
                },
                { 
                  id: '2.1.1.2', 
                  name: 'Data Scientist', 
                  type: 'career', 
                  description: 'Analyze complex data to extract insights',
                  details: {
                    salary: '₹8-30 LPA',
                    exams: ['JEE Main', 'GATE', 'Data Science Certifications'],
                    duration: '4 years B.Tech + 2 years M.Tech (optional)',
                    skills: ['Python', 'R', 'Machine Learning', 'Statistics', 'SQL'],
                    description: 'Extract insights from large datasets using statistical analysis and machine learning. Help organizations make data-driven decisions.'
                  }
                },
                { 
                  id: '2.1.1.3', 
                  name: 'Civil Engineer', 
                  type: 'career', 
                  description: 'Design and construct infrastructure',
                  details: {
                    salary: '₹3-12 LPA',
                    exams: ['JEE Main', 'JEE Advanced', 'GATE', 'State Engineering Exams'],
                    duration: '4 years B.Tech',
                    skills: ['AutoCAD', 'Project Management', 'Structural Analysis', 'Construction'],
                    description: 'Plan, design, and supervise construction of buildings, roads, bridges, and other infrastructure projects.'
                  }
                },
                { 
                  id: '2.1.1.4', 
                  name: 'Mechanical Engineer', 
                  type: 'career', 
                  description: 'Design and develop mechanical systems',
                  details: {
                    salary: '₹4-15 LPA',
                    exams: ['JEE Main', 'JEE Advanced', 'GATE', 'State Engineering Exams'],
                    duration: '4 years B.Tech',
                    skills: ['CAD Software', 'Thermodynamics', 'Manufacturing', 'Design Analysis'],
                    description: 'Design, develop, and test mechanical devices, engines, machines, and other mechanical systems used in various industries.'
                  }
                },
                { 
                  id: '2.1.1.5', 
                  name: 'Electrical Engineer', 
                  type: 'career', 
                  description: 'Work with electrical systems and power',
                  details: {
                    salary: '₹4-18 LPA',
                    exams: ['JEE Main', 'JEE Advanced', 'GATE', 'State Engineering Exams'],
                    duration: '4 years B.Tech',
                    skills: ['Circuit Design', 'Power Systems', 'Control Systems', 'Electronics'],
                    description: 'Design, develop, and maintain electrical systems, from power generation to electronic circuits and control systems.'
                  }
                },
                { 
                  id: '2.1.1.6', 
                  name: 'Computer Scientist', 
                  type: 'career', 
                  description: 'Research and develop computing technologies',
                  details: {
                    salary: '₹8-35 LPA',
                    exams: ['JEE Main', 'GATE', 'Research Entrance Exams'],
                    duration: '4 years B.Tech + M.Tech/PhD',
                    skills: ['Advanced Algorithms', 'Research', 'Mathematics', 'Programming'],
                    description: 'Conduct research in computer science, develop new technologies, and advance the field through innovation and theoretical work.'
                  }
                }
              ]
            },
            {
              id: '2.1.2',
              name: 'Architecture',
              type: 'degree',
              children: [
                { 
                  id: '2.1.2.1', 
                  name: 'Architect', 
                  type: 'career', 
                  description: 'Design buildings and structures',
                  details: {
                    salary: '₹3-15 LPA',
                    exams: ['NATA', 'JEE Main Paper 2', 'State Architecture Entrance'],
                    duration: '5 years B.Arch',
                    skills: ['Design Software', 'Creative Design', 'Building Codes', 'Project Management'],
                    description: 'Design and plan buildings and structures, ensuring they are functional, safe, and aesthetically pleasing.'
                  }
                },
                { 
                  id: '2.1.2.2', 
                  name: 'Interior Designer', 
                  type: 'career', 
                  description: 'Design interior spaces',
                  details: {
                    salary: '₹2-12 LPA',
                    exams: ['NATA', 'Design Aptitude Tests', 'Portfolio Reviews'],
                    duration: '3-4 years Bachelor in Interior Design',
                    skills: ['Space Planning', 'Color Theory', 'Furniture Design', 'Client Relations'],
                    description: 'Plan and design interior spaces to be functional and aesthetically appealing, working with clients to meet their needs.'
                  }
                }
              ]
            }
          ]
        },
        {
          id: '2.2',
          name: 'PCB (Physics, Chemistry, Biology)',
          type: 'degree',
          children: [
            {
              id: '2.2.1',
              name: 'Medical',
              type: 'degree',
              children: [
                { 
                  id: '2.2.1.1', 
                  name: 'Doctor (MBBS)', 
                  type: 'career', 
                  description: 'Diagnose and treat medical conditions',
                  details: {
                    salary: '₹8-50 LPA',
                    exams: ['NEET UG', 'NEET PG (for specialization)'],
                    duration: '5.5 years MBBS + 1 year internship',
                    skills: ['Medical Knowledge', 'Patient Care', 'Diagnosis', 'Communication'],
                    description: 'Provide medical care to patients. Diagnose illnesses, prescribe treatments, and promote health and wellness.'
                  }
                },
                { 
                  id: '2.2.1.2', 
                  name: 'Dentist', 
                  type: 'career', 
                  description: 'Treat dental and oral health issues',
                  details: {
                    salary: '₹5-25 LPA',
                    exams: ['NEET UG (for BDS)'],
                    duration: '5 years BDS + 1 year internship',
                    skills: ['Dental Procedures', 'Patient Care', 'Hand Dexterity', 'Oral Anatomy'],
                    description: 'Diagnose and treat problems with teeth, gums, and mouth. Perform dental procedures and educate patients on oral health.'
                  }
                },
                { 
                  id: '2.2.1.3', 
                  name: 'Surgeon', 
                  type: 'career', 
                  description: 'Perform surgical procedures',
                  details: {
                    salary: '₹15-80 LPA',
                    exams: ['NEET UG', 'NEET PG', 'Super Specialty Entrance'],
                    duration: '5.5 years MBBS + 3 years MS + Fellowship',
                    skills: ['Surgical Skills', 'Precision', 'Decision Making', 'Stamina'],
                    description: 'Perform complex surgical procedures to treat diseases, injuries, and deformities through operative methods.'
                  }
                },
                { 
                  id: '2.2.1.4', 
                  name: 'Psychiatrist', 
                  type: 'career', 
                  description: 'Treat mental health conditions',
                  details: {
                    salary: '₹10-40 LPA',
                    exams: ['NEET UG', 'NEET PG (Psychiatry)'],
                    duration: '5.5 years MBBS + 3 years MD Psychiatry',
                    skills: ['Psychology', 'Counseling', 'Medication Management', 'Empathy'],
                    description: 'Diagnose and treat mental health disorders using therapy, medication, and other psychiatric treatments.'
                  }
                },
                { 
                  id: '2.2.1.5', 
                  name: 'Radiologist', 
                  type: 'career', 
                  description: 'Interpret medical imaging',
                  details: {
                    salary: '₹12-60 LPA',
                    exams: ['NEET UG', 'NEET PG (Radiology)'],
                    duration: '5.5 years MBBS + 3 years MD Radiology',
                    skills: ['Image Interpretation', 'Technology', 'Attention to Detail', 'Medical Knowledge'],
                    description: 'Interpret medical images like X-rays, CT scans, and MRIs to diagnose diseases and guide treatment.'
                  }
                }
              ]
            },
            {
              id: '2.2.2',
              name: 'Pharmacy',
              type: 'degree',
              children: [
                { 
                  id: '2.2.2.1', 
                  name: 'Pharmacist', 
                  type: 'career', 
                  description: 'Dispense medications and counsel patients',
                  details: {
                    salary: '₹3-12 LPA',
                    exams: ['Various State Pharmacy Entrance Tests', 'GPAT'],
                    duration: '4 years B.Pharm',
                    skills: ['Drug Knowledge', 'Patient Counseling', 'Pharmaceutical Care', 'Regulations'],
                    description: 'Dispense prescription medications, counsel patients on drug usage, and ensure safe medication therapy.'
                  }
                },
                { 
                  id: '2.2.2.2', 
                  name: 'Drug Research Scientist', 
                  type: 'career', 
                  description: 'Research and develop new medications',
                  details: {
                    salary: '₹6-25 LPA',
                    exams: ['GPAT', 'GATE (Biotechnology)', 'Company Tests'],
                    duration: '4 years B.Pharm + M.Pharm + PhD',
                    skills: ['Research Methods', 'Chemistry', 'Clinical Trials', 'Data Analysis'],
                    description: 'Research and develop new pharmaceutical drugs, conduct clinical trials, and ensure drug safety and efficacy.'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '3',
      name: 'Commerce Stream (11th)',
      type: 'stream',
      description: '',
      children: [
        {
          id: '3.1',
          name: 'Bachelor of Commerce (B.Com)',
          type: 'degree',
          children: [
            { 
              id: '3.1.1', 
              name: 'Chartered Accountant (CA)', 
              type: 'career', 
              description: 'Manage financial records and compliance',
              details: {
                salary: '₹8-50 LPA',
                exams: ['CA Foundation', 'CA Intermediate', 'CA Final'],
                duration: '3-5 years CA Course',
                skills: ['Accounting', 'Taxation', 'Auditing', 'Financial Analysis'],
                description: 'Provide accounting, auditing, and tax services. Ensure compliance with financial regulations and help businesses with financial planning.'
              }
            },
            { 
              id: '3.1.2', 
              name: 'Financial Analyst', 
              type: 'career', 
              description: 'Analyze financial data and investments',
              details: {
                salary: '₹5-25 LPA',
                exams: ['CFA', 'FRM', 'Company Entrance Tests'],
                duration: '3 years B.Com + Certifications',
                skills: ['Financial Modeling', 'Excel', 'Investment Analysis', 'Risk Assessment'],
                description: 'Analyze financial data to guide investment decisions. Evaluate stocks, bonds, and other securities for investment recommendations.'
              }
            },
            { 
              id: '3.1.3', 
              name: 'Investment Banker', 
              type: 'career', 
              description: 'Help companies raise capital',
              details: {
                salary: '₹12-80 LPA',
                exams: ['MBA Entrance (CAT, GMAT)', 'CFA', 'Company Tests'],
                duration: '3 years B.Com + 2 years MBA',
                skills: ['Financial Modeling', 'Valuation', 'Deal Structuring', 'Client Relations'],
                description: 'Help corporations and governments raise capital through stock and bond offerings, mergers, and acquisitions.'
              }
            },
            { 
              id: '3.1.4', 
              name: 'Tax Consultant', 
              type: 'career', 
              description: 'Provide tax advice and services',
              details: {
                salary: '₹4-20 LPA',
                exams: ['CA', 'CS', 'Tax Practitioner Exams'],
                duration: '3 years B.Com + Professional Course',
                skills: ['Tax Laws', 'Compliance', 'Advisory', 'Documentation'],
                description: 'Help individuals and businesses with tax planning, compliance, and optimization strategies.'
              }
            },
            { 
              id: '3.1.5', 
              name: 'Management Consultant', 
              type: 'career', 
              description: 'Advise businesses on strategy',
              details: {
                salary: '₹8-40 LPA',
                exams: ['MBA Entrance (CAT, GMAT)', 'Company Case Studies'],
                duration: '3 years B.Com + 2 years MBA',
                skills: ['Strategy', 'Problem Solving', 'Presentation', 'Analytics'],
                description: 'Help organizations improve performance by analyzing problems and developing solutions for business challenges.'
              }
            }
          ]
        },
        {
          id: '3.2',
          name: 'Business Administration (BBA)',
          type: 'degree',
          children: [
            { 
              id: '3.2.1', 
              name: 'Marketing Manager', 
              type: 'career', 
              description: 'Develop marketing strategies',
              details: {
                salary: '₹6-30 LPA',
                exams: ['MBA Entrance', 'Company Assessments'],
                duration: '3 years BBA + 2 years MBA',
                skills: ['Marketing Strategy', 'Brand Management', 'Digital Marketing', 'Analytics'],
                description: 'Develop and implement marketing strategies to promote products and services, manage brand image, and drive sales.'
              }
            },
            { 
              id: '3.2.2', 
              name: 'Human Resources Manager', 
              type: 'career', 
              description: 'Manage employee relations and policies',
              details: {
                salary: '₹5-25 LPA',
                exams: ['MBA Entrance', 'HR Certifications'],
                duration: '3 years BBA + 2 years MBA (HR)',
                skills: ['People Management', 'Employment Law', 'Recruitment', 'Training'],
                description: 'Manage employee relations, recruitment, training, and organizational development to create effective workplaces.'
              }
            },
            { 
              id: '3.2.3', 
              name: 'Operations Manager', 
              type: 'career', 
              description: 'Oversee business operations',
              details: {
                salary: '₹6-28 LPA',
                exams: ['MBA Entrance', 'Operations Certifications'],
                duration: '3 years BBA + 2 years MBA (Operations)',
                skills: ['Process Optimization', 'Supply Chain', 'Quality Management', 'Leadership'],
                description: 'Oversee daily business operations, improve processes, and ensure efficient delivery of products and services.'
              }
            }
          ]
        }
      ]
    },
    {
      id: '4',
      name: 'Arts/Humanities (11th)',
      type: 'stream',
      description: '',
      children: [
        {
          id: '4.1',
          name: 'Liberal Arts',
          type: 'degree',
          children: [
            { 
              id: '4.1.1', 
              name: 'Teacher/Professor', 
              type: 'career', 
              description: 'Educate students in various subjects',
              details: {
                salary: '₹3-15 LPA',
                exams: ['CTET', 'TET', 'NET', 'B.Ed Entrance'],
                duration: '3 years BA + 2 years B.Ed + NET',
                skills: ['Subject Knowledge', 'Communication', 'Patience', 'Curriculum Design'],
                description: 'Teach students at various levels from primary to university. Develop curriculum, assess student progress, and contribute to educational research.'
              }
            },
            { 
              id: '4.1.2', 
              name: 'Civil Services (IAS/IPS)', 
              type: 'career', 
              description: 'Serve in government administration',
              details: {
                salary: '₹56K-2.5L per month + Benefits',
                exams: ['UPSC CSE (Prelims + Mains + Interview)'],
                duration: '3 years BA + UPSC Preparation',
                skills: ['General Knowledge', 'Administration', 'Leadership', 'Public Policy'],
                description: 'Serve as civil servants in various government departments. Implement government policies and manage public administration.'
              }
            },
            { 
              id: '4.1.3', 
              name: 'Journalist', 
              type: 'career', 
              description: 'Report news and write articles',
              details: {
                salary: '₹3-20 LPA',
                exams: ['Mass Communication Entrance', 'Company Tests'],
                duration: '3 years BA + Journalism Course',
                skills: ['Writing', 'Research', 'Communication', 'Current Affairs'],
                description: 'Research, write, and report news stories. Work for newspapers, magazines, TV, radio, or digital media platforms.'
              }
            },
            { 
              id: '4.1.4', 
              name: 'Social Worker', 
              type: 'career', 
              description: 'Help individuals and communities',
              details: {
                salary: '₹2-12 LPA',
                exams: ['MSW Entrance', 'NGO Selection Tests'],
                duration: '3 years BA + 2 years MSW',
                skills: ['Empathy', 'Counseling', 'Community Work', 'Case Management'],
                description: 'Work with individuals, families, and communities to address social problems and improve quality of life.'
              }
            },
            { 
              id: '4.1.5', 
              name: 'Psychologist', 
              type: 'career', 
              description: 'Study behavior and mental processes',
              details: {
                salary: '₹4-18 LPA',
                exams: ['MA Psychology Entrance', 'RCI License'],
                duration: '3 years BA Psychology + 2 years MA + Practice',
                skills: ['Psychology Theory', 'Counseling', 'Assessment', 'Research'],
                description: 'Study human behavior and mental processes. Provide therapy, conduct research, and assess psychological conditions.'
              }
            }
          ]
        },
        {
          id: '4.2',
          name: 'Law',
          type: 'degree',
          children: [
            { 
              id: '4.2.1', 
              name: 'Lawyer', 
              type: 'career', 
              description: 'Represent clients in legal matters',
              details: {
                salary: '₹3-50 LPA',
                exams: ['CLAT', 'AILET', 'State Law Entrance', 'Bar Council Exam'],
                duration: '5 years LLB or 3 years LLB after graduation',
                skills: ['Legal Research', 'Advocacy', 'Negotiation', 'Critical Thinking'],
                description: 'Represent clients in court, provide legal advice, and handle various legal matters including civil, criminal, and corporate law.'
              }
            },
            { 
              id: '4.2.2', 
              name: 'Judge', 
              type: 'career', 
              description: 'Preside over legal proceedings',
              details: {
                salary: '₹80K-3L per month + Benefits',
                exams: ['Judicial Services Exam', 'Higher Judicial Services'],
                duration: '5 years LLB + Legal Practice + Judicial Exam',
                skills: ['Legal Knowledge', 'Decision Making', 'Impartiality', 'Leadership'],
                description: 'Preside over court proceedings, interpret law, and make judicial decisions in civil and criminal cases.'
              }
            },
            { 
              id: '4.2.3', 
              name: 'Corporate Lawyer', 
              type: 'career', 
              description: 'Handle business legal matters',
              details: {
                salary: '₹8-60 LPA',
                exams: ['CLAT', 'Company Law Certifications'],
                duration: '5 years LLB + Corporate Law Specialization',
                skills: ['Corporate Law', 'Contract Law', 'Mergers & Acquisitions', 'Compliance'],
                description: 'Handle legal matters for corporations including contracts, mergers, compliance, and business transactions.'
              }
            }
          ]
        }
      ]
    },
    {
      id: '5',
      name: 'Vocational Training',
      type: 'stream',
      description: '',
      children: [
        {
          id: '5.1',
          name: 'Digital Skills',
          type: 'degree',
          children: [
            { 
              id: '5.1.1', 
              name: 'Web Developer', 
              type: 'career', 
              description: 'Build and maintain websites',
              details: {
                salary: '₹3-20 LPA',
                exams: ['Coding Tests', 'Technical Interviews', 'Certification Exams'],
                duration: '6 months - 2 years Training',
                skills: ['HTML/CSS', 'JavaScript', 'Frameworks', 'Database Management'],
                description: 'Create and maintain websites and web applications. Work with both front-end user interfaces and back-end server systems.'
              }
            },
            { 
              id: '5.1.2', 
              name: 'Digital Marketer', 
              type: 'career', 
              description: 'Promote products online',
              details: {
                salary: '₹2-15 LPA',
                exams: ['Google Ads Certification', 'Facebook Blueprint', 'HubSpot Certifications'],
                duration: '3-12 months Training',
                skills: ['SEO/SEM', 'Social Media', 'Analytics', 'Content Marketing'],
                description: 'Promote products and services through digital channels. Manage online advertising campaigns and analyze digital marketing metrics.'
              }
            },
            { 
              id: '5.1.3', 
              name: 'UI/UX Designer', 
              type: 'career', 
              description: 'Design user interfaces and experiences',
              details: {
                salary: '₹4-22 LPA',
                exams: ['Portfolio Reviews', 'Design Challenges', 'Company Tests'],
                duration: '6 months - 2 years Training',
                skills: ['Design Software', 'User Research', 'Prototyping', 'Visual Design'],
                description: 'Design intuitive and attractive user interfaces and experiences for websites, apps, and digital products.'
              }
            },
            { 
              id: '5.1.4', 
              name: 'Cybersecurity Specialist', 
              type: 'career', 
              description: 'Protect digital systems from threats',
              details: {
                salary: '₹6-35 LPA',
                exams: ['CEH', 'CISSP', 'CompTIA Security+', 'Company Tests'],
                duration: '1-3 years Training + Certifications',
                skills: ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Incident Response'],
                description: 'Protect computer systems and networks from cyber threats, conduct security assessments, and respond to security incidents.'
              }
            },
            { 
              id: '5.1.5', 
              name: 'Mobile App Developer', 
              type: 'career', 
              description: 'Create mobile applications',
              details: {
                salary: '₹4-25 LPA',
                exams: ['Technical Interviews', 'App Store Reviews', 'Coding Challenges'],
                duration: '6 months - 2 years Training',
                skills: ['Mobile Frameworks', 'App Design', 'API Integration', 'App Store Guidelines'],
                description: 'Design and develop mobile applications for iOS and Android platforms, focusing on user experience and functionality.'
              }
            }
          ]
        },
        {
          id: '5.2',
          name: 'Skilled Trades',
          type: 'degree',
          children: [
            { 
              id: '5.2.1', 
              name: 'Electrician', 
              type: 'career', 
              description: 'Install electrical systems',
              details: {
                salary: '₹2-8 LPA',
                exams: ['ITI Entrance', 'Electrician License Tests'],
                duration: '1-2 years ITI + Apprenticeship',
                skills: ['Electrical Systems', 'Safety Procedures', 'Problem Solving', 'Manual Dexterity'],
                description: 'Install, maintain, and repair electrical systems in homes, offices, and industrial buildings. Ensure electrical safety and compliance.'
              }
            },
            { 
              id: '5.2.2', 
              name: 'Chef', 
              type: 'career', 
              description: 'Prepare culinary dishes',
              details: {
                salary: '₹2-12 LPA',
                exams: ['Culinary School Entrance', 'Hotel Management Entrance'],
                duration: '1-4 years Culinary Training',
                skills: ['Cooking Techniques', 'Menu Planning', 'Food Safety', 'Creativity'],
                description: 'Prepare and cook food in restaurants, hotels, and catering services. Create menus and manage kitchen operations.'
              }
            },
            { 
              id: '5.2.3', 
              name: 'Plumber', 
              type: 'career', 
              description: 'Install and repair plumbing systems',
              details: {
                salary: '₹2-10 LPA',
                exams: ['ITI Entrance', 'Plumbing License Tests'],
                duration: '1-2 years ITI + Apprenticeship',
                skills: ['Pipe Systems', 'Water Systems', 'Problem Solving', 'Manual Skills'],
                description: 'Install, maintain, and repair plumbing systems including pipes, fixtures, and water systems in buildings.'
              }
            },
            { 
              id: '5.2.4', 
              name: 'Automotive Mechanic', 
              type: 'career', 
              description: 'Repair and maintain vehicles',
              details: {
                salary: '₹2-8 LPA',
                exams: ['ITI Entrance', 'Automotive Certifications'],
                duration: '1-2 years ITI + Experience',
                skills: ['Vehicle Systems', 'Diagnostic Tools', 'Problem Solving', 'Manual Dexterity'],
                description: 'Diagnose, repair, and maintain automobiles and other vehicles. Work with engines, brakes, and electrical systems.'
              }
            },
            { 
              id: '5.2.5', 
              name: 'Carpenter', 
              type: 'career', 
              description: 'Work with wood and construction',
              details: {
                salary: '₹2-8 LPA',
                exams: ['ITI Entrance', 'Carpentry Certifications'],
                duration: '1-2 years ITI + Apprenticeship',
                skills: ['Woodworking', 'Construction', 'Measurement', 'Tool Usage'],
                description: 'Construct, install, and repair structures and fixtures made of wood and other materials in buildings.'
              }
            }
          ]
        },
        {
          id: '5.3',
          name: 'Creative Arts',
          type: 'degree',
          children: [
            { 
              id: '5.3.1', 
              name: 'Graphic Designer', 
              type: 'career', 
              description: 'Create visual content and designs',
              details: {
                salary: '₹2-15 LPA',
                exams: ['Portfolio Reviews', 'Design Aptitude Tests'],
                duration: '6 months - 3 years Training',
                skills: ['Design Software', 'Creativity', 'Visual Communication', 'Branding'],
                description: 'Create visual concepts and designs for print and digital media, including logos, brochures, and websites.'
              }
            },
            { 
              id: '5.3.2', 
              name: 'Photographer', 
              type: 'career', 
              description: 'Capture images professionally',
              details: {
                salary: '₹2-20 LPA',
                exams: ['Portfolio Reviews', 'Photography Certifications'],
                duration: '6 months - 2 years Training',
                skills: ['Photography Techniques', 'Photo Editing', 'Lighting', 'Client Relations'],
                description: 'Take professional photographs for events, portraits, commercial purposes, and artistic expression.'
              }
            },
            { 
              id: '5.3.3', 
              name: 'Video Editor', 
              type: 'career', 
              description: 'Edit and produce video content',
              details: {
                salary: '₹3-18 LPA',
                exams: ['Portfolio Reviews', 'Technical Tests'],
                duration: '6 months - 2 years Training',
                skills: ['Video Editing Software', 'Storytelling', 'Audio Editing', 'Color Grading'],
                description: 'Edit raw video footage into polished final products for films, TV shows, commercials, and online content.'
              }
            }
          ]
        }
      ]
    }
  ]
};

function convertTreeNodes(apiNode: any): TreeNode {
  const hasDetails = apiNode.salary || apiNode.exams?.length || apiNode.duration || apiNode.skills?.length || apiNode.description;
  const node: TreeNode = {
    id: apiNode.id,
    name: apiNode.name,
    type: apiNode.type,
    description: apiNode.description || '',
    children: [],
  };
  if (hasDetails) {
    node.details = {
      salary: apiNode.salary || '',
      exams: apiNode.exams || [],
      duration: apiNode.duration || '',
      skills: apiNode.skills || [],
      description: apiNode.description || '',
    };
  }
  if (apiNode.children) {
    node.children = apiNode.children.map(convertTreeNodes);
  }
  return node;
}

const CareerNetworkGraph: React.FC = () => {
  const location = useLocation() as { state?: { pathwayData?: TreeNode } };
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [selectedCareer, setSelectedCareer] = useState<TreeNode | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const result: any[] = await apiGet(API.CAREER_TREE);
        const root = result.find((n: any) => n.type === 'root') || result[0];
        if (root) {
          const converted = convertTreeNodes(root);
          setTreeData(converted);
          setExpanded({ [converted.id]: true });
        }
      } catch (e) {
        console.warn('Failed to load career tree from API, using default', e);
        const fallback = location?.state?.pathwayData ?? defaultCareerTreeData;
        setTreeData(fallback);
        setExpanded({ [fallback.id]: true });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [expanded]);

  const rootData = treeData;

  if (loading) return <div style={{ padding: 48 }}><ChatSkeleton /></div>;
  if (!rootData) return <div style={{ padding: 48, color: '#94a3b8', textAlign: 'center' }}>No career data available.</div>;

  const toggleExpanded = (nodeId: string) => {
    setExpanded(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleCareerClick = (node: TreeNode) => {
    if (node.type === 'career' && node.details) {
      setSelectedCareer(node);
    } else if (node.children && node.children.length > 0) {
      toggleExpanded(node.id);
    }
  };

  const getNodeIcon = (type: TreeNode['type']) => {
    switch (type) {
      case 'root':
        return <GraduationCap size={20} />;
      case 'stream':
        return <BookOpen size={18} />;
      case 'degree':
        return <GraduationCap size={16} />;
      case 'career':
        return <Briefcase size={16} />;
      default:
        return <User size={16} />;
    }
  };

  const renderConnections = (parentNode: TreeNode, parentX: number, parentY: number, level: number) => {
    if (!parentNode.children || !expanded[parentNode.id]) return null;

    const connections: React.ReactNode[] = [];
    const childCount = parentNode.children.length;
    const startY = parentY - (childCount - 1) * 60;

    parentNode.children.forEach((child, index) => {
      const childY = startY + index * 120;
      const childX = parentX + 300;

      connections.push(
        <g key={`connection-${parentNode.id}-${child.id}`}>
          <line
            x1={parentX + 150}
            y1={parentY}
            x2={childX - 10}
            y2={childY}
            stroke="#4a90e2"
            strokeWidth="2"
            strokeDasharray="5,5"
            style={{
              animation: `drawLine 1s ease-in-out ${index * 0.1}s both`
            }}
          />
          <circle
            cx={childX - 10}
            cy={childY}
            r="3"
            fill="#4a90e2"
            style={{
              animation: `pulse 2s infinite ${index * 0.2}s`
            }}
          />
        </g>
      );

      if (child.children && expanded[child.id]) {
        const childConnections = renderConnections(child, childX, childY, level + 1);
        if (childConnections) {
          connections.push(...childConnections as React.ReactNode[]);
        }
      }
    });

    return connections;
  };

  const renderTreeNode = (node: TreeNode, x: number, y: number, level: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];
    const elements: React.ReactNode[] = [];

    elements.push(
      <g key={`node-${node.id}`}>
        <rect
          x={x - 75}
          y={y - 25}
          width="150"
          height="50"
          rx="25"
          fill={getNodeColor(node.type)}
          stroke={getNodeBorderColor(node.type)}
          strokeWidth="2"
          style={{
            cursor: 'pointer',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            animation: `nodeAppear 0.6s ease-out ${level * 0.1}s both`
          }}
          onClick={() => handleCareerClick(node)}
        />
        
        <foreignObject
          x={x - 70}
          y={y - 20}
          width="140"
          height="40"
          style={{ pointerEvents: 'none' }}
        >
          <div style={nodeTextStyle}>
            <div style={nodeIconContainerStyle}>
              {getNodeIcon(node.type)}
              {hasChildren && (
                <div style={expandIconStyle}>
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </div>
              )}
              {node.type === 'career' && <DollarSign size={10} style={{color: '#f39c12'}} />}
            </div>
            <div style={nodeTitleStyle}>{node.name}</div>
          </div>
        </foreignObject>
      </g>
    );

    if (hasChildren && isExpanded && node.children) {
      const childCount = node.children.length;
      const startY = y - (childCount - 1) * 60;

      node.children.forEach((child, index) => {
        const childY = startY + index * 120;
        const childX = x + 300;
        elements.push(...renderTreeNode(child, childX, childY, level + 1));
      });
    }

    return elements;
  };

  const getNodeColor = (type: TreeNode['type']) => {
    switch (type) {
      case 'root':
        return '#2c3e50';
      case 'stream':
        return '#34495e';
      case 'degree':
        return '#4a6741';
      case 'career':
        return '#8e44ad';
      default:
        return '#7f8c8d';
    }
  };

  const getNodeBorderColor = (type: TreeNode['type']) => {
    switch (type) {
      case 'root':
        return '#3498db';
      case 'stream':
        return '#2ecc71';
      case 'degree':
        return '#f39c12';
      case 'career':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const expandAll = () => {
    const getAllNodeIds = (node: TreeNode): string[] => {
      const ids = [node.id];
      if (node.children) {
        node.children.forEach(child => {
          ids.push(...getAllNodeIds(child));
        });
      }
      return ids;
    };

    const allIds = getAllNodeIds(rootData);
    const expandedState: ExpandedState = {};
    allIds.forEach(id => {
      expandedState[id] = true;
    });
    setExpanded(expandedState);
  };

  const collapseAll = () => {
    setExpanded({ [rootData.id]: true });
  };

  return (
    <div style={containerStyle}>
      <style>{keyframesCSS}</style>
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>Career Pathway Network Graph</h1>
        <p style={subtitleStyle}>
          Click nodes to explore career pathways. Click career nodes (purple) to see detailed information.
        </p>
        
        <div style={buttonContainerStyle}>
          <button onClick={expandAll} style={buttonStyle}>
            Expand All Paths
          </button>
          <button onClick={collapseAll} style={buttonStyleSecondary}>
            Collapse All
          </button>
        </div>
      </div>

      <div style={graphContainerStyle}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 2000 1500"
          style={svgStyle}
          key={animationKey}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {renderConnections(rootData, 150, 300, 0)}
          {renderTreeNode(rootData, 150, 300, 0)}
        </svg>
      </div>

      {selectedCareer && selectedCareer.details && (
        <div style={modalOverlayStyle} onClick={() => setSelectedCareer(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{selectedCareer.name}</h2>
              <button style={closeButtonStyle} onClick={() => setSelectedCareer(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div style={modalBodyStyle}>
              <div style={detailSectionStyle}>
                <div style={detailItemStyle}>
                  <DollarSign size={18} style={{color: '#27ae60'}} />
                  <div>
                    <strong>Average Salary (India):</strong>
                    <p style={detailTextStyle}>{selectedCareer.details.salary}</p>
                  </div>
                </div>

                <div style={detailItemStyle}>
                  <FileText size={18} style={{color: '#3498db'}} />
                  <div>
                    <strong>Required Exams:</strong>
                    <ul style={listStyle}>
                      {selectedCareer.details.exams.map((exam, index) => (
                        <li key={index} style={listItemStyle}>{exam}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={detailItemStyle}>
                  <Clock size={18} style={{color: '#e67e22'}} />
                  <div>
                    <strong>Duration:</strong>
                    <p style={detailTextStyle}>{selectedCareer.details.duration}</p>
                  </div>
                </div>

                <div style={detailItemStyle}>
                  <GraduationCap size={18} style={{color: '#9b59b6'}} />
                  <div>
                    <strong>Key Skills:</strong>
                    <div style={skillsContainerStyle}>
                      {selectedCareer.details.skills.map((skill, index) => (
                        <span key={index} style={skillTagStyle}>{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={descriptionSectionStyle}>
                  <h3 style={descriptionTitleStyle}>Career Description</h3>
                  <p style={descriptionTextStyle}>{selectedCareer.details.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  minHeight: '100dvh',
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  fontFamily: 'Arial, sans-serif',
  padding: '150px',
  marginLeft:'20vh',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '30px'
};

const titleStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#3498db',
  marginBottom: '10px',
  textShadow: '0 0 10px rgba(52, 152, 219, 0.5)'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: '#bdc3c7',
  marginBottom: '20px'
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '15px',
  marginBottom: '20px'
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 24px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '25px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
};

const buttonStyleSecondary: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#7f8c8d',
  boxShadow: '0 4px 15px rgba(127, 140, 141, 0.3)'
};

const graphContainerStyle: React.CSSProperties = {
  backgroundColor: '#2c3e50',
  borderRadius: '15px',
  padding: '20px',
  overflow: 'auto',
  height: '100vh',
  border: '2px solid #34495e',
  boxShadow: '0 0 30px rgba(0,0,0,0.5)'
};

const svgStyle: React.CSSProperties = {
  background: 'radial-gradient(circle at center, #34495e 0%, #2c3e50 100%)',
  borderRadius: '10px'
};

const nodeTextStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center'
};

const nodeIconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  color: '#ffffff'
};

const expandIconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center'
};

const nodeTitleStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#ffffff',
  marginTop: '2px',
  lineHeight: '1.2'
};

// Modal Styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#2c3e50',
  borderRadius: '15px',
  padding: '20px',
  maxWidth: '600px',
  maxHeight: '80vh',
  overflow: 'auto',
  border: '2px solid #3498db',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 25px',
  borderBottom: '2px solid #34495e',
  backgroundColor: '#34495e'
};

const modalTitleStyle: React.CSSProperties = {
  color: '#3498db',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  margin: 0
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#bdc3c7',
  cursor: 'pointer',
  padding: '5px'
};

const modalBodyStyle: React.CSSProperties = {
  padding: '25px'
};

const detailSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const detailItemStyle: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
  alignItems: 'flex-start'
};

const detailTextStyle: React.CSSProperties = {
  color: '#ecf0f1',
  margin: '5px 0 0 0',
  fontSize: '14px'
};

const listStyle: React.CSSProperties = {
  margin: '5px 0 0 0',
  paddingLeft: '20px',
  color: '#ecf0f1'
};

const listItemStyle: React.CSSProperties = {
  marginBottom: '3px',
  fontSize: '14px'
};

const skillsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '5px'
};

const skillTagStyle: React.CSSProperties = {
  backgroundColor: '#3498db',
  color: 'white',
  padding: '4px 12px',
  borderRadius: '15px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const descriptionSectionStyle: React.CSSProperties = {
  marginTop: '10px'
};

const descriptionTitleStyle: React.CSSProperties = {
  color: '#3498db',
  fontSize: '1.2rem',
  marginBottom: '10px'
};

const descriptionTextStyle: React.CSSProperties = {
  color: '#ecf0f1',
  lineHeight: '1.6',
  fontSize: '14px'
};

const keyframesCSS = `
  @keyframes nodeAppear {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes drawLine {
    0% {
      stroke-dashoffset: 100;
      opacity: 0;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%, 100% {
      r: 3;
      opacity: 1;
    }
    50% {
      r: 5;
      opacity: 0.7;
    }
  }

  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
  }

  rect:hover {
    filter: brightness(1.2) drop-shadow(0 6px 12px rgba(0,0,0,0.4));
  }
`;

export default CareerNetworkGraph;