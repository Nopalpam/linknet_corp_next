// src/app/news/page.jsx

import React from 'react';
import Hero from '@/components/main/Hero';
import CareerSneakPeek from '@/components/main/CareerSneakPeek';
import Management from '@/components/main/Management';
import ContactUs from '@/components/main/ContactUs';
import VisionMission from '@/components/main/VisionMission';
import Milestone from '@/components/main/Milestone';
import AwardsFeed from '@/components/main/AwardsFeed';
import AwardSneakPeek from '@/components/main/AwardSneakPeek';
import { getPublicSettings } from '@/lib/cmsApi';
import { buildBasicMetadata } from '@/lib/seo';


export async function generateMetadata({ params }) {
  const { locale } = await params;
  const publicSettings = await getPublicSettings();

  return buildBasicMetadata({
    title: "Let's Discover the Possibilities Together!",
    description: 'Life at Link Net, culture, people, and career stories.',
    locale,
    path: 'life-at-linknet',
    publicSettings,
  });
}

export default function CareerPage() {
  return (
    <main> {/* Tambahkan padding top (pt) agar tidak tertutup navbar */}
      
      {/* Panggil komponen NewsFeed kita di sini! */}
      <Hero name="life_at_linknet" />

      <CareerSneakPeek name="" />

      <Management />

      <ContactUs />

      <VisionMission name="about" />

      <Milestone name='history' />

      <AwardsFeed name='awards-list' />

      <AwardSneakPeek name='default' />
      
    </main>
  );
}
