// src/data/components/closingSentence.js

export const CLOSING_SENTENCE_DATA = {
  "default": {
    config: {
      sectionId: "default",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    introData: {
      as: "h2",
      label: "", // Kosongkan jika tidak butuh label kecil di atas
      title: "Have questions about Linknet?",
      description: "Empowering your business with reliable solutions and innovation for a connected, future-ready enterprise.",
      align: "center"
    },
    ctaList: [
      { 
        text: "Send Us a Message", 
        variant: "secondary-outline", 
        size: "lg", 
        iconLeft: "",
        iconRight: "",
        href: "/contact" 
      }
    ]
  },
  "fiberPreview": {
    config: {
      sectionId: "fiber-preview",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    introData: {
      as: "h2",
      label: "",
      title: "Get in touch with us now to unlock unparalleled connectivity solutions",
      description: "Empowering your business with reliable solutions and innovation for a connected, future-ready enterprise.",
      align: "center"
    },
    ctaList: [
      {
        text: "Consult with Us",
        variant: "primary",
        size: "lg",
        iconLeft: "",
        iconRight: "",
        href: "/contact"
      },
      {
        text: "Call Our Sales",
        variant: "secondary-outline",
        size: "lg",
        iconLeft: "whatsapp",
        iconRight: "",
        href: "tel:+622129536800"
      }
    ]
  },
  "mediaPreview": {
    config: {
      sectionId: "media-preview",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    introData: {
      as: "h2",
      label: "",
      title: "Enjoy the excitement of an interactive and intuitive television portal",
      description: "Empowering your business with reliable solutions and innovation for a connected, future-ready enterprise.",
      align: "center"
    },
    ctaList: [
      {
        text: "Consult with Us",
        variant: "primary",
        size: "lg",
        iconLeft: "",
        iconRight: "",
        href: "/contact"
      },
      {
        text: "Contact Sales",
        variant: "secondary-outline",
        size: "lg",
        iconLeft: "",
        iconRight: "",
        href: "tel:+622129536800"
      }
    ]
  }
};

export default CLOSING_SENTENCE_DATA;
