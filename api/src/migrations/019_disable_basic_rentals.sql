-- Migration 019: Disable basic rental items (bat and ball provided free at venue)
UPDATE rental_items
SET is_available = FALSE
WHERE name IN ('Cricket Bat', 'Cricket Ball');
