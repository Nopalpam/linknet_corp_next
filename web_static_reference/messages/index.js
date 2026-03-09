// messages/index.js
export async function getMessages(locale) {
  const global = (await import(`./globalData-${locale}.js`)).default;
  const hospitality = (await import(`./hospitalityData-${locale}.js`)).default;
  const OneStreamPlus = (await import(`./onestreamplusData-${locale}.js`)).default;
  const OneStream = (await import(`./onestreamData-${locale}.js`)).default;
  const faq = (await import(`./faqData-${locale}.js`)).default;

  return {
    global,
    hospitality,
    OneStreamPlus,
    OneStream,
    faq
  };
}