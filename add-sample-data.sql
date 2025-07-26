-- Sample businesses for testing
INSERT INTO businesses (name, description, category, address, city, state, zip_code, latitude, longitude, phone, email, contact_name, active) VALUES
('The Coffee Corner', 'Local coffee shop with fresh pastries and artisan coffee', 'Food & Beverage', '123 Main St', 'Kingsport', 'TN', '37660', 36.5481, -82.5618, '(423) 555-0101', 'info@coffeecorner.com', 'Sarah Johnson', true),

('Mountain View Diner', 'Family-owned diner serving comfort food since 1985', 'Food & Beverage', '456 Oak Ave', 'Bristol', 'TN', '37620', 36.5951, -82.1887, '(423) 555-0102', 'contact@mountainviewdiner.com', 'Mike Thompson', true),

('Appalachian Outfitters', 'Outdoor gear and equipment for hiking and camping', 'Retail', '789 Pine St', 'Johnson City', 'TN', '37601', 36.3134, -82.3535, '(423) 555-0103', 'sales@appoutfitters.com', 'Jennifer Davis', true),

('Healing Hands Spa', 'Full-service spa offering massages and wellness treatments', 'Health & Wellness', '321 Elm Dr', 'Elizabethton', 'TN', '37643', 36.3489, -82.2107, '(423) 555-0104', 'bookings@healinghands.com', 'Amanda Rodriguez', true),

('Fun Zone Arcade', 'Family entertainment center with games and laser tag', 'Entertainment & Recreation', '654 Maple Blvd', 'Kingsport', 'TN', '37664', 36.5285, -82.5312, '(423) 555-0105', 'info@funzonearcade.com', 'David Kim', true),

('Cuts & Styles Salon', 'Full-service hair salon with experienced stylists', 'Personal Services', '987 Cedar Rd', 'Bristol', 'TN', '37620', 36.5823, -82.1954, '(423) 555-0106', 'appointments@cutsandstyles.com', 'Lisa Martinez', true);

-- Sample coupons for testing
INSERT INTO coupons (business_id, title, description, discount_amount, terms, usage_limit_type, start_date, end_date, active) VALUES
-- Coffee Corner coupons
((SELECT id FROM businesses WHERE name = 'The Coffee Corner'), 
 'Free Pastry with Coffee', 
 'Get a free pastry when you purchase any large coffee drink', 
 'Free pastry (up to $4 value)', 
 'One per customer per visit. Cannot be combined with other offers.', 
 'daily', 
 NOW(), 
 NOW() + INTERVAL '30 days', 
 true),

((SELECT id FROM businesses WHERE name = 'The Coffee Corner'), 
 '20% Off Coffee Beans', 
 'Save 20% on any bag of our artisan coffee beans', 
 '20% off', 
 'Excludes already discounted items. Valid on retail bags only.', 
 'monthly_2', 
 NOW(), 
 NOW() + INTERVAL '45 days', 
 true),

-- Mountain View Diner coupons
((SELECT id FROM businesses WHERE name = 'Mountain View Diner'), 
 '$5 Off Dinner Special', 
 'Save $5 on any dinner entrée over $15', 
 '$5 off', 
 'Valid after 4 PM only. Cannot be used with other promotions.', 
 'once', 
 NOW(), 
 NOW() + INTERVAL '60 days', 
 true),

-- Appalachian Outfitters coupons
((SELECT id FROM businesses WHERE name = 'Appalachian Outfitters'), 
 '15% Off Hiking Gear', 
 'Get 15% off all hiking boots, backpacks, and outdoor apparel', 
 '15% off', 
 'Excludes sale items and gift cards. Minimum purchase $50.', 
 'monthly_1', 
 NOW(), 
 NOW() + INTERVAL '90 days', 
 true),

-- Healing Hands Spa coupons
((SELECT id FROM businesses WHERE name = 'Healing Hands Spa'), 
 'Buy One Massage, Get 50% Off Second', 
 'Purchase any 60-minute massage and get 50% off a second massage', 
 '50% off second massage', 
 'Both massages must be used within 30 days. Cannot be combined with other offers.', 
 'once', 
 NOW(), 
 NOW() + INTERVAL '30 days', 
 true),

-- Fun Zone Arcade coupons
((SELECT id FROM businesses WHERE name = 'Fun Zone Arcade'), 
 '$10 Game Card for $7', 
 'Purchase a $10 game card for only $7 - save $3!', 
 '$3 off', 
 'Limit one per person per day. Valid for new game cards only.', 
 'daily', 
 NOW(), 
 NOW() + INTERVAL '45 days', 
 true),

-- Cuts & Styles Salon coupons
((SELECT id FROM businesses WHERE name = 'Cuts & Styles Salon'), 
 '25% Off First Visit', 
 'New customers save 25% on any service during their first visit', 
 '25% off', 
 'New customers only. Cannot be combined with other offers. Appointment required.', 
 'once', 
 NOW(), 
 NOW() + INTERVAL '60 days', 
 true);