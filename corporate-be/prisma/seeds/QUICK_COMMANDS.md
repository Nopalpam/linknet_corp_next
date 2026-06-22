# Quick Commands for Pages Seeder

# 1. Seed only pages (safe - won't delete existing data)
npm run db:seed-pages

# 2. View seeded pages in database
# Connect to PostgreSQL and run:
SELECT 
  p.id,
  p.title,
  p.slug,
  p.status,
  p.template,
  COUNT(pc.id) as component_count,
  p.published_at,
  p.created_at
FROM pages p
LEFT JOIN page_components pc ON p.id = pc.page_id
GROUP BY p.id
ORDER BY p.created_at DESC;

# 3. View page components
SELECT 
  p.title as page_title,
  p.slug as page_slug,
  pc.component_type,
  pc."order",
  pc.is_visible,
  pc.created_at
FROM page_components pc
JOIN pages p ON pc.page_id = p.id
ORDER BY p.title, pc."order";

# 4. Check specific page with all components
SELECT 
  p.title,
  p.slug,
  p.status,
  json_agg(
    json_build_object(
      'type', pc.component_type,
      'order', pc."order",
      'data', pc.component_data
    ) ORDER BY pc."order"
  ) as components
FROM pages p
LEFT JOIN page_components pc ON p.id = pc.page_id
WHERE p.slug = 'home'
GROUP BY p.id;
