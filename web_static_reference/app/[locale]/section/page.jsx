// import { Geist, Geist_Mono } from "next/font/google";


import Hero from '@/components/main/Hero';
import HeroSliders from '@/components/main/HeroSliders';
import AboutWithUSP from '@/components/main/AboutWithUSP';
import TabBusiness from '@/components/main/TabBusiness';
import MapsCoverage from '@/components/main/MapsCoverage';
import NewsFeatured from '@/components/main/NewsFeatured';
import NewsTeaser from '@/components/main/NewsTeaser';
import ListReportHome from "@/components/main/ListReportHome";
import AboutValues from "@/components/main/AboutValues";
import InformationList from '@/components/main/InformationList';
import KeyHighlightWithImage from '@/components/main/KeyHighlightWithImage';
import HighlightingRealInitiatives from '@/components/main/HighlightingRealInitiatives';
import InfoContact from '@/components/main/InfoContact';
import AboutWithRunningPhotos from '@/components/main/AboutWithRunningPhotos';
import JoinFirstSquad from '@/components/main/JoinFirstSquad';
import ReportGrid from '@/components/main/ReportGrid';
import ReportList from '@/components/main/ReportList';


export default function Section() {
  return (
    <div>
      
        <Hero name="mission" />

        <HeroSliders 
            name="home" 
            className="bg__lightGradient"
        />

        <AboutWithUSP name="home" className="rounded-b-[32px]"
          slidesPerViewDesktop={4} 
          slidesPerViewMobile={1}
          gridColsDesktop={4} 
          gridColsMobile={1}
        />

        <TabBusiness name="home" className="mt-20"/>
        
        <ListReportHome name="home" />

        <MapsCoverage name="home" />

        <NewsFeatured />

        <NewsTeaser name="press-release" />

        <AboutValues name="corporate-values" 
          slidesPerViewDesktop={4} 
          slidesPerViewMobile={1.4}
        />

        <InformationList name='media' />

        <KeyHighlightWithImage name="impact" />

        <HighlightingRealInitiatives name='csr-programs' />

        <InfoContact name='esg' />

        <AboutWithRunningPhotos name='career' />

        <JoinFirstSquad name='career' />

        <ReportGrid name='sustainability-reports' />

        <ReportList
          name="financial-statement" 
          showTypeFilter 
          showStatusFilter 
          showYearFilter 
        />

    </div>
  );
}
