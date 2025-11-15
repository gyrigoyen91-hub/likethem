-- Update curator profile with real banner and bio
UPDATE public.curator_profiles
SET "bannerImage" = 'https://images.unsplash.com/photo-1520975922284-9f7b8801b2a9?q=80&w=1600',
    "bio" = 'Gonzalo curates timeless, minimal pieces for every day.',
    "isEditorsPick" = true
WHERE slug = 'gonzalo-yrigoyen';

-- Create category counts view for efficient aggregation
CREATE OR REPLACE VIEW public.v_curator_category_counts AS
SELECT p."curatorId", p.category, count(*)::int as count
FROM public.products p
WHERE p."isActive" = true
GROUP BY p."curatorId", p.category;
