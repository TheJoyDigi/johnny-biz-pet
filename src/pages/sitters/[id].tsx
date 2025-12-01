import fs from "fs";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import path from "path";

import Footer from "@/components/footer";
import Header from "@/components/header";
import SitterDetail from "@/components/sitters/SitterDetail";
import { getSitterById, Sitter, sitters, SitterGalleryPhoto } from "@/data/sitters";

type SitterPageProps = {
  sitter: Sitter;
};

const SitterPage = ({ sitter }: SitterPageProps) => {
  return (
    <>
      <Head>
        <title>{`${sitter.name} | Ruh-Roh Retreat Sitter Profile`}</title>
        <meta name="description" content={`Meet ${sitter.name}, a Ruh-Roh Retreat sitter serving ${sitter.locations[0]?.city ?? "Southern California"}.`} />
      </Head>
      <Header />
      <main className="bg-[#F4F4F9] min-h-screen py-10 sm:py-16">
        <div className="container mx-auto px-4 space-y-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <p className="uppercase tracking-widest text-sm font-semibold text-[#1A9CB0]">Sitter Profile</p>
            <Link
              href="/sitters"
              className="inline-flex items-center px-4 py-2 text-sm sm:text-base rounded-full bg-white text-[#1A9CB0] font-semibold shadow hover:shadow-md transition"
            >
              ← Back to all sitters
            </Link>
          </div>
          <SitterDetail sitter={sitter} />
          <div className="max-w-5xl mx-auto flex justify-center">
            <Link
              href="/sitters"
              className="inline-flex items-center px-5 py-3 text-sm sm:text-base rounded-full bg-white text-[#1A9CB0] font-semibold shadow hover:shadow-md transition"
            >
              ← Back to all sitters
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = sitters.map((sitter) => ({ params: { id: sitter.id } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<SitterPageProps> = ({ params }) => {
  const id = params?.id;
  if (typeof id !== "string") {
    return { notFound: true };
  }

  const sitter = getSitterById(id);

  if (!sitter) {
    return { notFound: true };
  }

  let gallery: SitterGalleryPhoto[] = [];
  const galleryDir = path.join(process.cwd(), "public", "sitters", sitter.uid, "gallery");
  try {
    if (fs.existsSync(galleryDir)) {
      const files = fs.readdirSync(galleryDir);
      gallery = files
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => ({
          src: `/sitters/${sitter.uid}/gallery/${file}`,
          alt: file.replace(/\.[^/.]+$/, "").replace(/-/g, " "),
        }));
    }
  } catch (error) {
    console.error(`Error loading gallery for sitter ${sitter.id}:`, error);
  }

  const sitterWithGallery: Sitter = {
    ...sitter,
    gallery,
  };

  return {
    props: {
      sitter: sitterWithGallery,
    },
  };
};

export default SitterPage;
