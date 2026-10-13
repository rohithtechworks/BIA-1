-- HOME SPOKEN CENTRE - SUPABASE SEED DATA

-- Insert Main Course
INSERT INTO public.courses (id, title, description, is_active)
VALUES ('home-spoken-english', 'Home Spoken Centre', 'Speak English in 10 Days - Spoken English Learning Portal', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Categories
INSERT INTO public.categories (id, course_id, name, description, color, display_order)
VALUES
('relative', 'home-spoken-english', 'Relative Circle', 'Everyday conversations, relationships, and family situations.', '#103665', 1),
('personal', 'home-spoken-english', 'Personal Circle', 'Talk about yourself, family, interests, routines, and experiences.', '#b71945', 2),
('official', 'home-spoken-english', 'Official Circle', 'Polite and professional English for formal communication.', '#ff741b', 3),
('public', 'home-spoken-english', 'Public Circle', 'Speaking in public, asking questions, giving opinions, and sharing ideas.', '#5915e9', 4),
('business', 'home-spoken-english', 'Business Circle', 'Workplace conversations, meetings, customers, and business communication.', '#05bd68', 5),
('fluency', 'home-spoken-english', 'Fluency Practice', 'Short speaking tasks, repetition, and practical fluency exercises.', '#079bb0', 6),
('question', 'home-spoken-english', 'Question Practice', 'Master asking targeted questions in English.', '#ff3034', 7),
('answer', 'home-spoken-english', 'Answer Practice', 'Master answering questions confidently in English.', '#901bb0', 8),
('grammar', 'home-spoken-english', 'Grammar & Tenses', 'Core English grammar rules, tenses, and sentence structures.', '#092fd1', 9),
('keywords', 'home-spoken-english', 'Spoken Keywords', 'Essential keywords and vocabulary for everyday spoken English.', '#6920ad', 10),
('pronunciation', 'home-spoken-english', 'Pronunciation', 'Clear pronunciation guides, phonetics, and speech audio practice.', '#ff19a7', 11)
ON CONFLICT (id) DO NOTHING;

-- Insert Lessons for Relative Circle
INSERT INTO public.lessons (id, category_id, title, description, display_order) VALUES
('relative-mother', 'relative', 'Mother', 'Speaking practice with Mother', 1),
('relative-father', 'relative', 'Father', 'Speaking practice with Father', 2),
('relative-elder-brother', 'relative', 'Elder Brother', 'Speaking practice with Elder Brother', 3),
('relative-younger-brother', 'relative', 'Younger Brother', 'Speaking practice with Younger Brother', 4),
('relative-elder-sister', 'relative', 'Elder Sister', 'Speaking practice with Elder Sister', 5),
('relative-younger-sister', 'relative', 'Younger Sister', 'Speaking practice with Younger Sister', 6),
('relative-grandpa', 'relative', 'Grandpa', 'Speaking practice with Grandpa', 7),
('relative-grandma', 'relative', 'Grandma', 'Speaking practice with Grandma', 8),
('relative-uncle', 'relative', 'Uncle', 'Speaking practice with Uncle', 9),
('relative-auntie', 'relative', 'Auntie', 'Speaking practice with Auntie', 10),
('relative-paternal-uncle', 'relative', 'Paternal Uncle', 'Speaking practice with Paternal Uncle', 11),
('relative-cousin', 'relative', 'Cousin', 'Speaking practice with Cousin', 12),
('relative-niece', 'relative', 'Niece', 'Speaking practice with Niece', 13)
ON CONFLICT (id) DO NOTHING;

-- Insert Lessons for Personal Circle
INSERT INTO public.lessons (id, category_id, title, description, display_order) VALUES
('personal-friend', 'personal', 'Friend', 'Speaking practice with Friend', 1),
('personal-classmate', 'personal', 'Classmate', 'Speaking practice with Classmate', 2),
('personal-girlfriend', 'personal', 'Girlfriend', 'Speaking practice with Girlfriend', 3),
('personal-close-friend', 'personal', 'Close Friend', 'Speaking practice with Close Friend', 4),
('personal-birthday-girl', 'personal', 'Birthday Girl', 'Speaking practice with Birthday Girl', 5),
('personal-college-mate', 'personal', 'College Mate', 'Speaking practice with College Mate', 6),
('personal-cricket-captain', 'personal', 'Cricket Captain', 'Speaking practice with Cricket Captain', 7),
('personal-class-leader', 'personal', 'Class Leader', 'Speaking practice with Class Leader', 8),
('personal-neighbor', 'personal', 'Neighbor', 'Speaking practice with Neighbor', 9),
('personal-co-passenger', 'personal', 'Co-passenger', 'Speaking practice with Co-passenger', 10)
ON CONFLICT (id) DO NOTHING;

-- Insert Lessons for Official Circle
INSERT INTO public.lessons (id, category_id, title, description, display_order) VALUES
('official-class-teacher', 'official', 'Class Teacher', 'Speaking practice with Class Teacher', 1),
('official-tuition-master', 'official', 'Tuition Master', 'Speaking practice with Tuition Master', 2),
('official-headmaster', 'official', 'Headmaster', 'Speaking practice with Headmaster', 3),
('official-professor', 'official', 'Professor', 'Speaking practice with Professor', 4),
('official-principal', 'official', 'Principal', 'Speaking practice with Principal', 5),
('official-librarian', 'official', 'Librarian', 'Speaking practice with Librarian', 6),
('official-interviewer', 'official', 'Interviewer', 'Speaking practice with Interviewer', 7)
ON CONFLICT (id) DO NOTHING;

-- Insert Lessons for Public Circle
INSERT INTO public.lessons (id, category_id, title, description, display_order) VALUES
('public-bank-manager', 'public', 'Bank Manager', 'Speaking practice with Bank Manager', 1),
('public-postmaster', 'public', 'Postmaster', 'Speaking practice with Postmaster', 2),
('public-railway-clerk', 'public', 'Railway Clerk', 'Speaking practice with Railway Clerk', 3),
('public-tte', 'public', 'TTE', 'Speaking practice with TTE', 4),
('public-receptionist', 'public', 'Receptionist', 'Speaking practice with Receptionist', 5),
('public-doctor', 'public', 'Doctor', 'Speaking practice with Doctor', 6),
('public-inspector', 'public', 'Inspector', 'Speaking practice with Inspector', 7),
('public-mla', 'public', 'MLA', 'Speaking practice with MLA', 8),
('public-junior-engineer', 'public', 'Junior Engineer', 'Speaking practice with Junior Engineer', 9),
('public-general-manager', 'public', 'General Manager', 'Speaking practice with General Manager', 10)
ON CONFLICT (id) DO NOTHING;

-- Insert Lessons for Business Circle
INSERT INTO public.lessons (id, category_id, title, description, display_order) VALUES
('business-buyer', 'business', 'Buyer', 'Speaking practice with Buyer', 1),
('business-vendor', 'business', 'Vendor', 'Speaking practice with Vendor', 2),
('business-shopkeeper', 'business', 'Shopkeeper', 'Speaking practice with Shopkeeper', 3),
('business-supplier', 'business', 'Supplier', 'Speaking practice with Supplier', 4),
('business-salesgirl', 'business', 'Salesgirl', 'Speaking practice with Salesgirl', 5),
('business-salesman', 'business', 'Salesman', 'Speaking practice with Salesman', 6),
('business-courier-manager', 'business', 'Courier Manager', 'Speaking practice with Courier Manager', 7),
('business-centre-in-charge', 'business', 'Centre In-charge', 'Speaking practice with Centre In-charge', 8)
ON CONFLICT (id) DO NOTHING;

-- Insert Lessons for Fluency Practice
INSERT INTO public.lessons (id, category_id, title, description, display_order) VALUES
('fluency-friend', 'fluency', 'Friend', 'Fluency practice scenario with Friend', 1),
('fluency-missed-call-friend', 'fluency', 'Missed Call Friend', 'Fluency practice scenario with Missed Call Friend', 2),
('fluency-heroine', 'fluency', 'Heroine', 'Fluency practice scenario with Heroine', 3),
('fluency-travel-friend', 'fluency', 'Travel Friend', 'Fluency practice scenario with Travel Friend', 4),
('fluency-business', 'fluency', 'Business', 'Fluency practice scenario with Business', 5),
('fluency-hero', 'fluency', 'Hero', 'Fluency practice scenario with Hero', 6),
('fluency-politician', 'fluency', 'Politician', 'Fluency practice scenario with Politician', 7),
('fluency-interviewer', 'fluency', 'Interviewer', 'Fluency practice scenario with Interviewer', 8)
ON CONFLICT (id) DO NOTHING;

-- Insert Lessons for Question & Answer Practice
INSERT INTO public.lessons (id, category_id, title, description, display_order) VALUES
('question-0', 'question', 'WH - Questions', 'Practice formulating WH questions', 1),
('question-1', 'question', 'BE - Form', 'Practice BE form questions', 2),
('question-2', 'question', 'Do - Form', 'Practice Do form questions', 3),
('question-3', 'question', 'Have - Form', 'Practice Have form questions', 4),
('question-4', 'question', 'Modals', 'Practice questions using Modal verbs', 5),

('answer-0', 'answer', 'WH - Questions', 'Practice answering WH questions', 1),
('answer-1', 'answer', 'BE - Form', 'Practice answering BE form questions', 2),
('answer-2', 'answer', 'Do - Form', 'Practice answering Do form questions', 3),
('answer-3', 'answer', 'Have - Form', 'Practice answering Have form questions', 4),
('answer-4', 'answer', 'Modals', 'Practice answering Modal questions', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert Lessons for Grammar, Keywords & Pronunciation
INSERT INTO public.lessons (id, category_id, title, description, display_order) VALUES
('grammar-0', 'grammar', 'Grammar Starters', 'Foundational English grammar concepts', 1),
('grammar-1', 'grammar', 'Parts of Speech', 'Detailed breakdown of parts of speech', 2),
('grammar-2', 'grammar', 'Tenses', 'Complete tenses mastery and usage', 3),
('grammar-3', 'grammar', 'Transformation', 'Sentence transformation rules', 4),

('keywords-0', 'keywords', 'Noun Words', 'Spoken English noun vocabulary', 1),
('keywords-1', 'keywords', 'Correlation Words', 'Connecting and correlation words', 2),
('keywords-2', 'keywords', 'Action Words', 'Common action verbs in speech', 3),
('keywords-3', 'keywords', 'Verb-Forms', 'Verb forms and conjugation practice', 4),
('keywords-4', 'keywords', 'Grammar & Tenses', 'Spoken keywords in grammar context', 5),

('pronunciation-0', 'pronunciation', 'Pronunciation A - L', 'Pronunciation rules for letters A through L', 1),
('pronunciation-1', 'pronunciation', 'Pronunciation M - Z', 'Pronunciation rules for letters M through Z', 2),
('pronunciation-2', 'pronunciation', 'Explanation', 'Speech sound explanation & phonetic tips', 3)
ON CONFLICT (id) DO NOTHING;
