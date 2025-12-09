import { test, expect } from '@playwright/test';

test.describe('Ruh Roh Retreat Comprehensive E2E Test', () => {

  test('Landing Page loads with correct metadata and content', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Ruh-Roh Retreat/);

    // Check main heading exists
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check header navigation exists
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check basic SEO
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
    
    // Check if canonical link exists (optional but good for SEO)
    // const canonical = page.locator('link[rel="canonical"]');
    // await expect(canonical).toHaveAttribute('href', /.+/);
  });

  test('Sitters Page displays available sitters', async ({ page }) => {
    await page.goto('/sitters');

    await expect(page).toHaveTitle(/Sitters/i);

    // Check that we have sitters listed
    // Assuming sitter cards have some specific class or text
    await expect(page.getByRole('heading', { name: 'Johnny', exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Trudy', exact: false })).toBeVisible();

    // Check for links to profiles
    const johnnyLink = page.getByRole('link', { name: /View Details/i }).first();
    await expect(johnnyLink).toBeVisible();
  });

  test('Sitter Details Page (Johnny) loads correctly with SEO', async ({ page }) => {
    await page.goto('/sitters/johnny-irvine');

    // Check Name in H1 or similar prominent place
    await expect(page.locator('h1')).toContainText('Johnny');

    // Check Title includes Name and Location
    await expect(page).toHaveTitle(/Johnny.*Irvine/i);

    // Check Meta Description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Johnny/);
    await expect(metaDescription).toHaveAttribute('content', /Irvine/);

    // Check for actions
    const bookButton = page.getByRole('button', { name: /Book/i }).or(page.getByRole('link', { name: /Book/i }));
    await expect(bookButton.first()).toBeVisible();

    // Check for Bio/Content
    await expect(page.getByText('boutique-style staycations')).toBeVisible();
  });

  test('Blog Page lists posts and Single Post works', async ({ page }) => {
    // List Page
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog|Ruh-Roh/i);
    
    // Check key post exists
    const postLink = page.getByRole('link', { name: /Kennel vs. In-Home Boarding/i });
    await expect(postLink).toBeVisible();

    // Navigate to post
    await postLink.click();
    await page.waitForURL('**/blog/kennel-vs-in-home-boarding-which-is-right-for-your-dog');

    // Check Single Post H1
    await expect(page.locator('h1')).toContainText('Kennel vs. In-Home Boarding');

    // Check SEO on single post
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);
  });

  test('Global SEO checks (robots.txt and sitemap.xml)', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
  });

});
