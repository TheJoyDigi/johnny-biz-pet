import { createClient } from "@supabase/supabase-js";
import { Sitter, SitterServices, SitterDiscounts, SitterAddOnCategory, SitterReview, SitterGalleryPhoto } from "@/data/sitters";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function fetchSittersFromDb(): Promise<Sitter[]> {
  const { data: sittersData, error } = await supabase
    .from("sitters")
    .select(`
      *,
      users (first_name),
      sitter_addons (*),
      sitter_discounts (*),
      sitter_reviews (*)
    `);

  if (error) {
    console.error("Error fetching sitters from DB:", error);
    return [];
  }

  return Promise.all(sittersData.map(async (dbSitter: any) => {
    const primaryServices = [
        {
            name: "Dog Boarding",
            description: "Boutique overnight stays with cozy suites, hourly wellness checks, and 24/7 supervision.",
            price: `$${dbSitter.base_rate_cents / 100}/night`
        },
        {
            name: "Doggy Daycare",
            description: "Structured daytime care with enrichment walks, rest dens, and constant communication.",
            price: `$${dbSitter.base_rate_cents / 100}/night`
        }
    ];

    const addOnItems = dbSitter.sitter_addons.map((addon: any) => ({
        name: addon.name,
        description: addon.description,
        price: `$${addon.price_cents / 100}`
    }));

    const addOns: SitterAddOnCategory[] = [
        {
            category: "Add-ons",
            items: addOnItems
        }
    ];

    const services: SitterServices = {
        primary: primaryServices,
        addOns: addOns
    };

    const lengthOfStayDiscounts = dbSitter.sitter_discounts.map((d: any) => ({
        label: `${d.min_days}+ nights`,
        detail: `${d.percentage}% off`
    }));

    const discounts: SitterDiscounts = {
        lengthOfStay: lengthOfStayDiscounts,
        additionalDog: [{ label: "Additional dog", detail: "$45/night per extra dog" }], 
        referral: [{ label: "Referral Discount", detail: "10% off" }] 
    };

    // Map reviews
    const reviews: SitterReview[] = dbSitter.sitter_reviews.map((r: any) => ({
        id: r.id,
        client: r.client_name,
        pet: r.pet_name || "",
        rating: r.rating,
        date: new Date(r.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: '2-digit' }), 
        text: r.text,
        image: r.image_url,
        source: r.source
    }));

    // Map legacy UID for reviews and gallery
    let legacyUid = "sr-001";
    if (dbSitter.slug === "trudy-wildomar") legacyUid = "sr-002";
    else if (dbSitter.slug === "johnny-irvine") legacyUid = "sr-001";

    // Fetch Gallery Images from Storage
    let gallery: SitterGalleryPhoto[] = [];
    const { data: galleryFiles } = await supabase.storage.from('sitter-images').list(`${legacyUid}/gallery`);
    if (galleryFiles) {
        gallery = galleryFiles
            .filter(f => f.name !== '.DS_Store')
            .map(f => ({
                src: `${supabaseUrl}/storage/v1/object/public/sitter-images/${legacyUid}/gallery/${f.name}`,
                alt: f.name.replace(/\.[^/.]+$/, "").replace(/-/g, " ")
            }));
    }

    return {
        id: dbSitter.slug || dbSitter.id, 
        uid: legacyUid, 
        name: dbSitter.users?.first_name || "Sitter", 
        tagline: dbSitter.tagline,
        avatar: dbSitter.avatar_url,
        heroImage: dbSitter.hero_image_url,
        locations: [dbSitter.location_details],
        bio: dbSitter.bio,
        skills: dbSitter.skills,
        homeEnvironment: dbSitter.home_environment,
        badges: dbSitter.badges,
        services: services,
        policies: dbSitter.policies,
        discounts: discounts,
        reviews: reviews,
        gallery: gallery,
        contactEmail: "bookings@ruhrohretreat.com"
    } as Sitter;
  }));
}