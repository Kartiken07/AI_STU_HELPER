from Database import sessionlocal, engine, Base
import models_database

Base.metadata.create_all(bind=engine)

TREE = {
    "1": {"name": "10th Pass", "type": "root", "parent_id": None, "description": "", "sort_order": 0},
    "2": {"name": "Science Stream (11th)", "type": "stream", "parent_id": "1", "sort_order": 0},
    "3": {"name": "Commerce Stream (11th)", "type": "stream", "parent_id": "1", "sort_order": 1},
    "4": {"name": "Arts Stream (11th)", "type": "stream", "parent_id": "1", "sort_order": 2},
    "5": {"name": "Vocational Stream (11th)", "type": "stream", "parent_id": "1", "sort_order": 3},

    "2.1": {"name": "PCM (Physics, Chemistry, Maths)", "type": "degree", "parent_id": "2", "sort_order": 0},
    "2.2": {"name": "PCB (Physics, Chemistry, Biology)", "type": "degree", "parent_id": "2", "sort_order": 1},

    "2.1.1": {"name": "Engineering (B.Tech/B.E.)", "type": "degree", "parent_id": "2.1", "description": "Engineering is the application of science and mathematics to solve real-world problems.", "salary": "3-25 LPA", "exams": ["JEE Main", "JEE Advanced", "BITSAT", "State CET"], "duration": "4 years", "skills": ["Mathematics", "Physics", "Problem Solving", "Analytical Thinking"], "sort_order": 0},
    "2.1.2": {"name": "Architecture (B.Arch)", "type": "degree", "parent_id": "2.1", "description": "Architecture blends creativity with technical knowledge to design buildings and structures.", "salary": "3-15 LPA", "exams": ["NATA", "JEE Main Paper 2"], "duration": "5 years", "skills": ["Drawing", "Design", "Creativity", "Technical Knowledge"], "sort_order": 1},
    "2.1.3": {"name": "Computer Applications (BCA)", "type": "degree", "parent_id": "2.1", "description": "BCA focuses on computer applications and software development.", "salary": "3-12 LPA", "exams": ["University Entrance", "Merit Based"], "duration": "3 years", "skills": ["Programming", "Database", "Web Development", "Problem Solving"], "sort_order": 2},
    "2.1.4": {"name": "Defence (NDA)", "type": "degree", "parent_id": "2.1", "description": "NDA trains candidates for officer positions in the Indian Armed Forces.", "salary": "8-20 LPA", "exams": ["NDA Exam", "SSB Interview"], "duration": "3 years training", "skills": ["Leadership", "Physical Fitness", "Discipline", "Strategic Thinking"], "sort_order": 3},

    "2.2.1": {"name": "Medical (MBBS)", "type": "degree", "parent_id": "2.2", "description": "MBBS is the undergraduate medical degree to become a doctor.", "salary": "5-30 LPA", "exams": ["NEET UG"], "duration": "5.5 years", "skills": ["Science", "Empathy", "Patience", "Problem Solving"], "sort_order": 0},
    "2.2.2": {"name": "Dental (BDS)", "type": "degree", "parent_id": "2.2", "description": "BDS is the undergraduate degree for dental surgery.", "salary": "4-15 LPA", "exams": ["NEET UG"], "duration": "5 years", "skills": ["Manual Dexterity", "Science", "Communication", "Attention to Detail"], "sort_order": 1},
    "2.2.3": {"name": "Pharmacy (B.Pharm)", "type": "degree", "parent_id": "2.2", "description": "B.Pharm covers drug development, testing, and patient care.", "salary": "3-10 LPA", "exams": ["MHT CET", "UPSEE", "University Entrance"], "duration": "4 years", "skills": ["Chemistry", "Biology", "Research", "Attention to Detail"], "sort_order": 2},
    "2.2.4": {"name": "Biotechnology", "type": "degree", "parent_id": "2.2", "description": "Biotechnology uses living systems to develop products and technologies.", "salary": "4-12 LPA", "exams": ["KCET", "University Entrance"], "duration": "3-4 years", "skills": ["Biology", "Chemistry", "Lab Techniques", "Research"], "sort_order": 3},
    "2.2.5": {"name": "Agriculture (B.Sc. Ag.)", "type": "degree", "parent_id": "2.2", "description": "Agriculture science focuses on farming, food production, and sustainability.", "salary": "3-8 LPA", "exams": ["ICAR AIEEA", "State CET"], "duration": "4 years", "skills": ["Biology", "Environmental Science", "Research", "Management"], "sort_order": 4},
    "2.2.6": {"name": "Veterinary Science", "type": "degree", "parent_id": "2.2", "description": "Veterinary science deals with animal health, disease prevention, and treatment.", "salary": "4-12 LPA", "exams": ["NEET UG", "ICAR AIEEA"], "duration": "5 years", "skills": ["Biology", "Animal Care", "Surgery", "Diagnosis"], "sort_order": 5},

    "3.1": {"name": "B.Com", "type": "degree", "parent_id": "3", "sort_order": 0},
    "3.2": {"name": "BBA/BMS", "type": "degree", "parent_id": "3", "sort_order": 1},
    "3.3": {"name": "CA Foundation", "type": "degree", "parent_id": "3", "sort_order": 2},
    "3.4": {"name": "CS (Company Secretary)", "type": "degree", "parent_id": "3", "sort_order": 3},

    "3.1.1": {"name": "Chartered Accountancy", "type": "career", "parent_id": "3.1", "description": "CA handles auditing, taxation, and financial management.", "salary": "7-25 LPA", "exams": ["CA Foundation", "CA Intermediate", "CA Final"], "duration": "4-5 years", "skills": ["Accounting", "Taxation", "Auditing", "Analytical Skills"], "sort_order": 0},
    "3.1.2": {"name": "Investment Banking", "type": "career", "parent_id": "3.1", "description": "Investment banking involves raising capital and M&A advisory for corporations.", "salary": "10-40 LPA", "exams": ["CFA", "MBA Finance"], "duration": "2-3 years additional", "skills": ["Finance", "Analytical Skills", "Deal Negotiation", "Market Knowledge"], "sort_order": 1},
    "3.1.3": {"name": "Financial Analysis", "type": "career", "parent_id": "3.1", "description": "Financial analysts evaluate investment opportunities and prepare reports.", "salary": "5-18 LPA", "exams": ["CFA", "MBA"], "duration": "2-3 years", "skills": ["Financial Modeling", "Data Analysis", "Excel", "Reporting"], "sort_order": 2},

    "3.2.1": {"name": "Marketing Management", "type": "career", "parent_id": "3.2", "description": "Marketing managers develop strategies to promote products and brands.", "salary": "5-20 LPA", "exams": ["MBA Marketing", "PGDM"], "duration": "2 years", "skills": ["Communication", "Creativity", "Market Research", "Digital Marketing"], "sort_order": 0},
    "3.2.2": {"name": "Human Resources", "type": "career", "parent_id": "3.2", "description": "HR manages recruitment, employee relations, and organizational culture.", "salary": "4-15 LPA", "exams": ["MBA HR", "PGDM"], "duration": "2 years", "skills": ["Communication", "Interpersonal Skills", "Organization", "Conflict Resolution"], "sort_order": 1},
    "3.2.3": {"name": "Operations Management", "type": "career", "parent_id": "3.2", "description": "Operations management oversees production, supply chain, and business efficiency.", "salary": "6-18 LPA", "exams": ["MBA Operations", "PGDM"], "duration": "2 years", "skills": ["Logistics", "Supply Chain", "Process Optimization", "Leadership"], "sort_order": 2},

    "3.3.1": {"name": "Chartered Accountant", "type": "career", "parent_id": "3.3", "description": "CA provides audit, tax, and financial advisory services.", "salary": "7-25 LPA", "exams": ["CA Foundation", "CA Inter", "CA Final"], "duration": "4-5 years", "skills": ["Accounting", "Audit", "Taxation", "Analytics"], "sort_order": 0},

    "3.4.1": {"name": "Company Secretary", "type": "career", "parent_id": "3.4", "description": "CS ensures legal compliance and corporate governance.", "salary": "5-15 LPA", "exams": ["CSEET", "CS Executive", "CS Professional"], "duration": "3-4 years", "skills": ["Legal Knowledge", "Corporate Law", "Compliance", "Documentation"], "sort_order": 0},

    "4.1": {"name": "BA (Bachelor of Arts)", "type": "degree", "parent_id": "4", "sort_order": 0},
    "4.2": {"name": "BFA (Fine Arts)", "type": "degree", "parent_id": "4", "sort_order": 1},
    "4.3": {"name": "B.JMC (Journalism)", "type": "degree", "parent_id": "4", "sort_order": 2},
    "4.4": {"name": "LLB (Law after 12th)", "type": "degree", "parent_id": "4", "sort_order": 3},
    "4.5": {"name": "B.Des (Design)", "type": "degree", "parent_id": "4", "sort_order": 4},
    "4.6": {"name": "Hotel Management", "type": "degree", "parent_id": "4", "sort_order": 5},

    "4.1.1": {"name": "Civil Services (IAS/IPS/IFS)", "type": "career", "parent_id": "4.1", "description": "Civil servants implement government policies and administer public services.", "salary": "8-30 LPA", "exams": ["UPSC CSE"], "duration": "1-2 years prep", "skills": ["General Knowledge", "Analytical Writing", "Leadership", "Ethics"], "sort_order": 0},
    "4.1.2": {"name": "Psychologist", "type": "career", "parent_id": "4.1", "description": "Psychologists study behavior and mental processes to help people.", "salary": "3-12 LPA", "exams": ["University Entrance", "M.Phil"], "duration": "5-6 years", "skills": ["Empathy", "Research", "Communication", "Patience"], "sort_order": 1},
    "4.1.3": {"name": "Economist", "type": "career", "parent_id": "4.1", "description": "Economists analyze data and trends to advise on economic policy.", "salary": "6-20 LPA", "exams": ["UGC NET", "MBA", "MA Economics"], "duration": "2-3 years", "skills": ["Data Analysis", "Statistics", "Research", "Critical Thinking"], "sort_order": 2},
    "4.1.4": {"name": "English/Hindi/Regional Literature Professor", "type": "career", "parent_id": "4.1", "description": "Professors teach and research literature at universities and colleges.", "salary": "5-15 LPA", "exams": ["UGC NET", "PhD"], "duration": "5-6 years", "skills": ["Writing", "Research", "Teaching", "Critical Analysis"], "sort_order": 3},
    "4.1.5": {"name": "Social Worker", "type": "career", "parent_id": "4.1", "description": "Social workers help individuals and communities improve their well-being.", "salary": "3-8 LPA", "exams": ["MSW Entrance", "University Merit"], "duration": "2 years", "skills": ["Empathy", "Communication", "Organization", "Advocacy"], "sort_order": 4},

    "4.3.1": {"name": "Journalist", "type": "career", "parent_id": "4.3", "description": "Journalists investigate and report news for print, broadcast, or digital media.", "salary": "3-15 LPA", "exams": ["University Entrance", "Internship Experience"], "duration": "3 years + internship", "skills": ["Writing", "Research", "Communication", "Ethics"], "sort_order": 0},
    "4.3.2": {"name": "Mass Communication Specialist", "type": "career", "parent_id": "4.3", "description": "Mass communication specialists create content for large audiences via various media.", "salary": "4-12 LPA", "exams": ["University Entrance", "PG Diploma"], "duration": "2-3 years", "skills": ["Media Production", "Content Creation", "Public Speaking", "Digital Media"], "sort_order": 1},

    "4.4.1": {"name": "Lawyer/Advocate", "type": "career", "parent_id": "4.4", "description": "Lawyers represent clients in legal matters and provide legal advice.", "salary": "3-30 LPA", "exams": ["CLAT", "AILET", "LSAT"], "duration": "5 years + Bar Exam", "skills": ["Argumentation", "Research", "Legal Knowledge", "Communication"], "sort_order": 0},
    "4.4.2": {"name": "Judge (Judicial Services)", "type": "career", "parent_id": "4.4", "description": "Judges preside over court proceedings and deliver justice.", "salary": "12-30 LPA", "exams": ["State Judicial Services Exam"], "duration": "5+ years experience", "skills": ["Legal Knowledge", "Impartiality", "Judgment", "Ethics"], "sort_order": 1},
    "4.4.3": {"name": "Legal Advisor", "type": "career", "parent_id": "4.4", "description": "Legal advisors provide counsel to organizations on legal matters.", "salary": "6-20 LPA", "exams": ["CLAT", "Company Secretary"], "duration": "5 years", "skills": ["Contract Law", "Negotiation", "Corporate Law", "Compliance"], "sort_order": 2},

    "4.5.1": {"name": "Fashion Designer", "type": "career", "parent_id": "4.5", "description": "Fashion designers create clothing and accessory designs.", "salary": "4-15 LPA", "exams": ["NIFT", "NID", "CEPT"], "duration": "4 years", "skills": ["Creativity", "Sewing", "Trend Awareness", "Illustration"], "sort_order": 0},
    "4.5.2": {"name": "Interior Designer", "type": "career", "parent_id": "4.5", "description": "Interior designers plan and execute interior spaces for aesthetics and function.", "salary": "4-12 LPA", "exams": ["NID", "CEED", "University Entrance"], "duration": "4 years", "skills": ["Design", "Space Planning", "Color Theory", "Client Management"], "sort_order": 1},
    "4.5.3": {"name": "UX/UI Designer", "type": "career", "parent_id": "4.5", "description": "UX/UI designers create user-friendly interfaces for digital products.", "salary": "6-25 LPA", "exams": ["Portfolio Based", "Certifications"], "duration": "3-4 years", "skills": ["User Research", "Wireframing", "Prototyping", "Visual Design"], "sort_order": 2},

    "4.6.1": {"name": "Hotel Manager", "type": "career", "parent_id": "4.6", "description": "Hotel managers oversee operations of hotels and hospitality establishments.", "salary": "4-12 LPA", "exams": ["NCHMCT JEE", "University Entrance"], "duration": "4 years + training", "skills": ["Hospitality", "Management", "Communication", "Customer Service"], "sort_order": 0},
    "4.6.2": {"name": "Event Manager", "type": "career", "parent_id": "4.6", "description": "Event managers plan and coordinate events like conferences, weddings, and shows.", "salary": "4-10 LPA", "exams": ["Certifications", "Degree Programs"], "duration": "3-4 years", "skills": ["Organization", "Creativity", "Negotiation", "Time Management"], "sort_order": 1},
    "4.6.3": {"name": "Travel & Tourism Specialist", "type": "career", "parent_id": "4.6", "description": "Travel specialists plan trips, advise travelers, and promote destinations.", "salary": "3-8 LPA", "exams": ["IATA Certification", "University Programs"], "duration": "3 years", "skills": ["Travel Knowledge", "Communication", "Sales", "Cultural Awareness"], "sort_order": 2},

    "5.1": {"name": "ITI (Engineering Trades)", "type": "degree", "parent_id": "5", "sort_order": 0},
    "5.2": {"name": "Polytechnic Diploma", "type": "degree", "parent_id": "5", "sort_order": 1},
    "5.3": {"name": "Paramedical (ANM/GNM)", "type": "degree", "parent_id": "5", "sort_order": 2},
    "5.4": {"name": "Digital Marketing/Creative Arts", "type": "degree", "parent_id": "5", "sort_order": 3},

    "5.1.1": {"name": "Electrician", "type": "career", "parent_id": "5.1", "description": "Electricians install, maintain, and repair electrical systems.", "salary": "2-6 LPA", "exams": ["ITI Trade Exam", "Apprenticeship"], "duration": "1-2 years", "skills": ["Electrical Knowledge", "Safety", "Troubleshooting", "Physical Fitness"], "sort_order": 0},
    "5.1.2": {"name": "Plumber", "type": "career", "parent_id": "5.1", "description": "Plumbers install and repair water and drainage systems.", "salary": "2-5 LPA", "exams": ["ITI Trade Exam", "Apprenticeship"], "duration": "1-2 years", "skills": ["Technical Skills", "Problem Solving", "Physical Stamina", "Customer Service"], "sort_order": 1},
    "5.1.3": {"name": "Welder", "type": "career", "parent_id": "5.1", "description": "Welders join metal parts using heat and specialized equipment.", "salary": "2-6 LPA", "exams": ["ITI Trade Exam", "Certifications"], "duration": "1-2 years", "skills": ["Technical Skills", "Precision", "Safety Awareness", "Physical Strength"], "sort_order": 2},

    "5.2.1": {"name": "Civil Engineering Technician", "type": "career", "parent_id": "5.2", "description": "Civil engineering technicians assist in construction projects.", "salary": "3-8 LPA", "exams": ["Polytechnic Diploma", "State CET"], "duration": "3 years", "skills": ["Drafting", "Site Management", "Surveying", "Technical Drawing"], "sort_order": 0},
    "5.2.2": {"name": "Mechanical Technician", "type": "career", "parent_id": "5.2", "description": "Mechanical technicians maintain and repair machinery.", "salary": "3-7 LPA", "exams": ["Polytechnic Diploma", "Apprenticeship"], "duration": "3 years", "skills": ["Mechanical Knowledge", "Repair", "Maintenance", "Blueprint Reading"], "sort_order": 1},

    "5.3.1": {"name": "Nurse (GNM/B.Sc Nursing)", "type": "career", "parent_id": "5.3", "description": "Nurses provide patient care, assist doctors, and manage healthcare settings.", "salary": "3-8 LPA", "exams": ["AIIMS Nursing", "University Entrance"], "duration": "3-4 years", "skills": ["Patient Care", "Medical Knowledge", "Compassion", "Communication"], "sort_order": 0},
    "5.3.2": {"name": "Lab Technician", "type": "career", "parent_id": "5.3", "description": "Lab technicians analyze samples and assist in medical diagnostics.", "salary": "2-6 LPA", "exams": ["University Entrance", "Diploma Programs"], "duration": "2-3 years", "skills": ["Lab Techniques", "Attention to Detail", "Medical Knowledge", "Safety Protocols"], "sort_order": 1},

    "5.4.1": {"name": "Digital Marketing Specialist", "type": "career", "parent_id": "5.4", "description": "Digital marketers promote brands through online channels.", "salary": "3-12 LPA", "exams": ["Certifications", "Portfolio", "Experience"], "duration": "3-6 months certification", "skills": ["SEO", "Social Media", "Content Marketing", "Analytics"], "sort_order": 0},
    "5.4.2": {"name": "Content Creator/Photographer", "type": "career", "parent_id": "5.4", "description": "Content creators produce engaging media for digital platforms.", "salary": "2-15 LPA", "exams": ["Portfolio Based"], "duration": "Varies", "skills": ["Photography", "Editing", "Creativity", "Storytelling"], "sort_order": 1},
}

def seed():
    db = sessionlocal()
    existing = db.query(models_database.CareerNode).first()
    if existing:
        print("Career data already seeded, skipping.")
        db.close()
        return

    for node_id, data in TREE.items():
        node = models_database.CareerNode(
            id=node_id,
            name=data["name"],
            type=data["type"],
            parent_id=data["parent_id"],
            description=data.get("description", ""),
            salary=data.get("salary", ""),
            exams=data.get("exams", []),
            duration=data.get("duration", ""),
            skills=data.get("skills", []),
            sort_order=data.get("sort_order", 0),
        )
        db.add(node)

    db.commit()
    db.close()
    print(f"Seeded {len(TREE)} career nodes.")

if __name__ == "__main__":
    seed()
