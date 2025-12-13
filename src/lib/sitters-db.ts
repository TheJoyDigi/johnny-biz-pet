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
      sitter_primary_services (
        id,
        price_cents,
        service_types (
            name,
            description,
            slug
        )
      ),
      sitter_addons (*),
      sitter_discounts (*),
      sitter_reviews (*)
    `)
    .order('slug', { ascending: true })
    .eq('is_active', true);

  if (error) {
    console.error("Error fetching sitters from DB:", error);
    return [];
  }

  return Promise.all(sittersData.map(async (dbSitter: any) => {
    // Map primary services from DB relation
    const primaryServices = dbSitter.sitter_primary_services.map((ps: any) => ({
        id: ps.id, // Map ID
        name: ps.service_types.name,
        description: ps.service_types.description,
        price: `$${ps.price_cents / 100}/night`
    })).sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Fallback if no services found (shouldn't happen for migrated data)
    if (primaryServices.length === 0) {
        // Keep empty loop or default?
    }

    const addOnItems = dbSitter.sitter_addons.map((addon: any) => ({
        id: addon.id,
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

    // Fetch Gallery Images from Storage using UUID
    let gallery: SitterGalleryPhoto[] = [];
    // Use dbSitter.id for the folder name
    const { data: galleryFiles } = await supabase.storage.from('sitter-images').list(`${dbSitter.id}/gallery`);
    if (galleryFiles) {
        gallery = galleryFiles
            .filter(f => f.name !== '.DS_Store')
            .map(f => ({
                src: `${supabaseUrl}/storage/v1/object/public/sitter-images/${dbSitter.id}/gallery/${f.name}`,
                alt: f.name.replace(/\.[^/.]+$/, "").replace(/-/g, " ")
            }));
    }

    return {
        id: dbSitter.id, // ID is now UUID
        slug: dbSitter.slug, // Explicit slug property
        uid: dbSitter.id, // UID alias for UUID 
        name: dbSitter.users?.first_name || "Sitter", 
        tagline: dbSitter.tagline,
        avatar: dbSitter.avatar_url,
        heroImage: dbSitter.hero_image_url,
        locations: [dbSitter.location_details],
        bio: dbSitter.bio,
        careStyle: dbSitter.care_style || [],
        parentExpectations: dbSitter.parent_expectations || [],
        skills: dbSitter.skills,
        homeEnvironment: dbSitter.home_environment,
        badges: dbSitter.badges,
        services: services,
        policies: dbSitter.policies,
        discounts: discounts,
        reviews: reviews,
        gallery: gallery,
        contactEmail: "bookings@ruhrohretreat.com",
        cancellationPolicyMarkdown: dbSitter.cancellation_policy_markdown
    } as Sitter;
  }));
}