import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeder for Pages and PageComponents
 * This will create sample pages with components for testing the Page Builder
 * Note: This seeder is SAFE - it won't delete existing data
 */
export async function seedPages() {
  console.log('📄 Seeding pages...');

  try {
    // Get the first admin user to be the creator
    const adminUser = await prisma.user.findFirst({
      where: {
        userRoles: {
          some: {
            role: {
              slug: 'super-admin'  // Changed from super_admin to super-admin (with dash)
            }
          }
        }
      }
    });

    if (!adminUser) {
      console.log('⚠️  No admin user found. Please seed users first.');
      return;
    }

    // Sample pages data
    const pagesData = [
      {
        slug: 'home',
        title: 'Home Page',
        metaTitle: 'Welcome to Linknet Corporation',
        metaDescription: 'Linknet Corporation - Leading Internet Service Provider in Indonesia',
        metaKeywords: 'linknet, internet, fiber, broadband, indonesia',
        status: 'PUBLISHED' as const,
        template: 'LANDING' as const,
        publishedAt: new Date(),
        components: [
          {
            type: 'hero',
            data: {
              title: 'Welcome to Linknet Corporation',
              subtitle: 'Your Trusted Internet Service Provider',
              description: 'Experience lightning-fast internet speeds with our fiber optic network. Connect with confidence.',
              backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920',
              buttonText: 'Get Started',
              buttonLink: '/contact',
              alignment: 'center',
              overlayOpacity: 0.5
            },
            order: 0,
            isVisible: true
          },
          {
            type: 'features',
            data: {
              title: 'Why Choose Linknet',
              subtitle: 'Premium Internet Services',
              features: [
                {
                  icon: 'Zap',
                  title: 'Ultra-Fast Speed',
                  description: 'Up to 1 Gbps fiber optic connection for seamless browsing and streaming'
                },
                {
                  icon: 'Shield',
                  title: 'Secure & Reliable',
                  description: '99.9% uptime guarantee with enterprise-grade security'
                },
                {
                  icon: 'Headphones',
                  title: '24/7 Support',
                  description: 'Round-the-clock customer support ready to assist you'
                },
                {
                  icon: 'Award',
                  title: 'Award Winning',
                  description: 'Recognized as the best ISP provider in Indonesia'
                }
              ],
              layout: 'grid',
              columns: 4
            },
            order: 1,
            isVisible: true
          },
          {
            type: 'cta',
            data: {
              title: 'Ready to Get Started?',
              description: 'Join thousands of satisfied customers enjoying high-speed internet',
              primaryButtonText: 'View Plans',
              primaryButtonLink: '/plans',
              secondaryButtonText: 'Contact Us',
              secondaryButtonLink: '/contact',
              backgroundColor: '#0066cc',
              textColor: '#ffffff'
            },
            order: 2,
            isVisible: true
          }
        ]
      },
      {
        slug: 'about-us',
        title: 'About Us',
        metaTitle: 'About Linknet Corporation',
        metaDescription: 'Learn more about Linknet Corporation, our history, mission, and commitment to excellence',
        metaKeywords: 'about linknet, company profile, mission, vision',
        status: 'PUBLISHED' as const,
        template: 'DEFAULT' as const,
        publishedAt: new Date(),
        components: [
          {
            type: 'hero',
            data: {
              title: 'About Linknet Corporation',
              subtitle: 'Connecting Indonesia Since 2000',
              description: 'We are committed to providing world-class internet services to homes and businesses across Indonesia',
              backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920',
              buttonText: 'Our Story',
              buttonLink: '#story',
              alignment: 'left',
              overlayOpacity: 0.6
            },
            order: 0,
            isVisible: true
          },
          {
            type: 'text',
            data: {
              content: `
                <h2>Our Story</h2>
                <p>Founded in 2000, Linknet Corporation has grown from a small startup to become one of Indonesia's leading Internet Service Providers. With over 20 years of experience, we've continuously evolved to meet the changing needs of our customers.</p>
                <p>Today, we serve hundreds of thousands of customers across major cities in Indonesia, providing reliable, high-speed internet connections that power homes, businesses, and communities.</p>
                
                <h3>Our Mission</h3>
                <p>To connect every Indonesian household and business with fast, reliable, and affordable internet access, enabling digital transformation and economic growth.</p>
                
                <h3>Our Vision</h3>
                <p>To be the most trusted and innovative internet service provider in Indonesia, recognized for exceptional service quality and customer satisfaction.</p>
              `,
              maxWidth: '800px',
              alignment: 'left'
            },
            order: 1,
            isVisible: true
          },
          {
            type: 'stats',
            data: {
              title: 'Our Impact',
              stats: [
                {
                  value: '500K+',
                  label: 'Active Customers',
                  icon: 'Users'
                },
                {
                  value: '50+',
                  label: 'Cities Covered',
                  icon: 'MapPin'
                },
                {
                  value: '99.9%',
                  label: 'Uptime',
                  icon: 'Activity'
                },
                {
                  value: '20+',
                  label: 'Years Experience',
                  icon: 'Award'
                }
              ],
              backgroundColor: '#f8f9fa',
              columns: 4
            },
            order: 2,
            isVisible: true
          }
        ]
      },
      {
        slug: 'contact',
        title: 'Contact Us',
        metaTitle: 'Contact Linknet - Get in Touch',
        metaDescription: 'Contact Linknet Corporation for inquiries, support, or business partnerships',
        metaKeywords: 'contact linknet, customer support, contact form',
        status: 'PUBLISHED' as const,
        template: 'DEFAULT' as const,
        publishedAt: new Date(),
        components: [
          {
            type: 'hero',
            data: {
              title: 'Get in Touch',
              subtitle: 'We\'re Here to Help',
              description: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
              backgroundImage: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920',
              alignment: 'center',
              overlayOpacity: 0.7,
              height: '400px'
            },
            order: 0,
            isVisible: true
          },
          {
            type: 'contact-info',
            data: {
              title: 'Contact Information',
              contacts: [
                {
                  icon: 'Phone',
                  label: 'Phone',
                  value: '+62 21 1500 123',
                  link: 'tel:+622115000123'
                },
                {
                  icon: 'Mail',
                  label: 'Email',
                  value: 'info@linknet.co.id',
                  link: 'mailto:info@linknet.co.id'
                },
                {
                  icon: 'MapPin',
                  label: 'Address',
                  value: 'Jl. Gatot Subroto, Jakarta 12930, Indonesia',
                  link: 'https://maps.google.com'
                },
                {
                  icon: 'Clock',
                  label: 'Business Hours',
                  value: 'Mon - Fri: 9:00 AM - 6:00 PM',
                  link: null
                }
              ],
              layout: 'grid',
              columns: 2
            },
            order: 1,
            isVisible: true
          },
          {
            type: 'contact-form',
            data: {
              title: 'Send Us a Message',
              description: 'Fill out the form below and our team will get back to you within 24 hours',
              fields: [
                { name: 'name', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email Address', type: 'email', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
                { name: 'subject', label: 'Subject', type: 'text', required: true },
                { name: 'message', label: 'Message', type: 'textarea', required: true }
              ],
              submitButtonText: 'Send Message',
              successMessage: 'Thank you! We\'ll get back to you soon.',
              errorMessage: 'Something went wrong. Please try again.'
            },
            order: 2,
            isVisible: true
          }
        ]
      },
      {
        slug: 'services',
        title: 'Our Services',
        metaTitle: 'Linknet Services - Internet Plans & Solutions',
        metaDescription: 'Explore our range of internet plans and solutions for home and business',
        metaKeywords: 'linknet services, internet plans, fiber optic, broadband',
        status: 'PUBLISHED' as const,
        template: 'DEFAULT' as const,
        publishedAt: new Date(),
        components: [
          {
            type: 'hero',
            data: {
              title: 'Our Services',
              subtitle: 'Internet Solutions for Everyone',
              description: 'From home to enterprise, we have the perfect plan for you',
              backgroundImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920',
              alignment: 'center',
              overlayOpacity: 0.5
            },
            order: 0,
            isVisible: true
          },
          {
            type: 'pricing',
            data: {
              title: 'Choose Your Plan',
              subtitle: 'Flexible plans that grow with your needs',
              plans: [
                {
                  name: 'Home Basic',
                  price: 'Rp 350,000',
                  period: '/month',
                  description: 'Perfect for small households',
                  features: [
                    'Up to 30 Mbps',
                    'Unlimited Data',
                    'Free Installation',
                    'Email Support'
                  ],
                  highlighted: false,
                  buttonText: 'Subscribe Now',
                  buttonLink: '/subscribe/home-basic'
                },
                {
                  name: 'Home Premium',
                  price: 'Rp 550,000',
                  period: '/month',
                  description: 'Ideal for families and streaming',
                  features: [
                    'Up to 100 Mbps',
                    'Unlimited Data',
                    'Free Installation',
                    'Priority Support',
                    'Free WiFi Router'
                  ],
                  highlighted: true,
                  buttonText: 'Subscribe Now',
                  buttonLink: '/subscribe/home-premium'
                },
                {
                  name: 'Business',
                  price: 'Rp 2,500,000',
                  period: '/month',
                  description: 'Enterprise-grade connectivity',
                  features: [
                    'Up to 1 Gbps',
                    'Unlimited Data',
                    'Free Installation',
                    '24/7 Priority Support',
                    'Free WiFi Router',
                    'Static IP Address',
                    'SLA Guarantee'
                  ],
                  highlighted: false,
                  buttonText: 'Contact Sales',
                  buttonLink: '/contact-sales'
                }
              ],
              columns: 3
            },
            order: 1,
            isVisible: true
          }
        ]
      },
      {
        slug: 'draft-page-example',
        title: 'Draft Page Example',
        metaTitle: 'Draft Page - Not Published',
        metaDescription: 'This is a draft page for testing purposes',
        status: 'DRAFT' as const,
        template: 'DEFAULT' as const,
        components: [
          {
            type: 'text',
            data: {
              content: '<h1>This is a Draft Page</h1><p>This page is not published yet and only visible in the admin panel.</p>',
              alignment: 'center'
            },
            order: 0,
            isVisible: true
          }
        ]
      }
    ];

    // Create pages with components
    for (const pageData of pagesData) {
      // Check if page already exists
      const existingPage = await prisma.page.findUnique({
        where: { slug: pageData.slug }
      });

      if (existingPage) {
        console.log(`   ⏭️  Page "${pageData.title}" (${pageData.slug}) already exists, skipping...`);
        continue;
      }

      // Extract components from pageData
      const { components, ...pageInfo } = pageData;

      // Create page
      const page = await prisma.page.create({
        data: {
          ...pageInfo,
          createdById: adminUser.id
        }
      });

      // Create components for the page
      for (const component of components) {
        await prisma.pageComponent.create({
          data: {
            pageId: page.id,
            type: component.type,
            data: component.data,
            order: component.order,
            isVisible: component.isVisible
          }
        });
      }

      console.log(`   ✅ Created page: "${page.title}" (${page.slug}) with ${components.length} components`);
    }

    console.log('✅ Pages seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding pages:', error);
    throw error;
  }
}

// Allow running this seeder standalone
if (require.main === module) {
  seedPages()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
