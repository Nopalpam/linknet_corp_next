/**
 * SolutionsFiltered.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Config layer untuk komponen SolutionsFiltered.
 *
 * Struktur per entry:
 *   labelSection  {string}   Label kecil di atas judul sidebar
 *   titleSection  {string}   Judul utama sidebar
 *   category      {object}   Keyed by category slug, setiap value berisi:
 *     ├── titleCategory  {string}    Judul kategori yang ditampilkan di UI
 *     ├── descCategory   {string}    Deskripsi di bawah judul kategori
 *     └── solutions      {string[]}  Array id item dari solutionsData.js
 *
 * Pola penggunaan:
 *   import { SOLUTIONS_FILTERED_CONFIG } from '@/data/components/SolutionsFiltered';
 *   const config = SOLUTIONS_FILTERED_CONFIG['enterprise'];
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SOLUTIONS_FILTERED_CONFIG = {

  // ── Enterprise ─────────────────────────────────────────────────────────────
  enterprise: {
    config: {
      sectionId: "enterprise",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    labelSection: 'SOLUTIONS',
    titleSection: 'Solutions for Enterprise',
    category: {

      connectivity: {
        titleCategory: 'Connectivity',
        descCategory:
          'Berikan kelancaran transaksi data antar kantor cabang secara aman, stabil dan efisien melalui layanan konektivitas andal.',
        solutions: [
          'dedicated-internet-access',
          'datacomm',
          'vsat',
          'metro-ethernet',
        ],
      },

      'ict-solutions': {
        titleCategory: 'ICT Solutions',
        descCategory:
          'Tingkatkan efisiensi bisnis Anda dengan solusi teknologi informasi dan komunikasi terpadu yang dirancang untuk kebutuhan enterprise.',
        solutions: [
          'ict-solutions',
          'cybersecurity',
          'colocation',
        ],
      },

      cloud: {
        titleCategory: 'Cloud',
        descCategory:
          'Permudah transformasi digital perusahaan Anda dengan layanan cloud yang aman, fleksibel, dan hemat biaya.',
        solutions: [
          'cloud-computing',
          'cloud-backup',
          'disaster-recovery',
        ],
      },

      'professional-service': {
        titleCategory: 'Professional Service',
        descCategory:
          'Solusi yang menjamin efisiensi dan keandalan infrastruktur IT, membantu bisnis beroperasi tanpa hambatan dan tumbuh menuju tujuan strategisnya.',
        solutions: [
          'managed-service',
          'corporate-tv',
          'network-consulting',
        ],
      },

    },
  },

  // ── SME ────────────────────────────────────────────────────────────────────
  sme: {
    config: {
      sectionId: "sme",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    labelSection: 'SOLUTIONS',
    titleSection: 'Solutions for SME',
    category: {

      connectivity: {
        titleCategory: 'Connectivity',
        descCategory:
          'Jaringan yang stabil dan terjangkau untuk mendukung operasional bisnis skala menengah dan kecil Anda.',
        solutions: [
          'dedicated-internet-access',
          'datacomm',
        ],
      },

      cloud: {
        titleCategory: 'Cloud',
        descCategory:
          'Solusi cloud yang mudah diakses dan scalable, dirancang khusus untuk kebutuhan bisnis berkembang.',
        solutions: [
          'cloud-backup',
        ],
      },

      'professional-service': {
        titleCategory: 'Professional Service',
        descCategory:
          'Layanan profesional yang membantu bisnis Anda tumbuh dengan dukungan IT yang andal dan efisien.',
        solutions: [
          'professional-service',
        ],
      },

    },
  },

  // ── Media & Entertainment ──────────────────────────────────────────────────
  'media-entertainment': {
    labelSection: 'SOLUTIONS',
    titleSection: 'Solutions for Media & Entertainment',
    category: {

      connectivity: {
        titleCategory: 'Connectivity',
        descCategory:
          'Berikan kelancaran transaksi data antar kantor cabang secara aman, stabil dan efisien melalui layanan konektivitas andal.',
        solutions: [
          'dedicated-internet-access',
          'datacomm',
          'vsat',
        ],
      },

      'professional-service': {
        titleCategory: 'Professional Service',
        descCategory:
          'Solusi yang menjamin efisiensi dan keandalan infrastruktur IT, membantu bisnis beroperasi tanpa hambatan dan tumbuh menuju tujuan strategisnya.',
        solutions: [
          'managed-service',
          'corporate-tv',
        ],
      },

    },
  },

};