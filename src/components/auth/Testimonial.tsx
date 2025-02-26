
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  image: string;
  quote: string;
  author: string;
  position: string;
}

const testimonials: Testimonial[] = [
  {
    image: "/lovable-uploads/e70188ba-8a3e-4333-8e8a-7a5d5d6f2cd8.png",
    quote: "Bright Candy transformed our development process. The speed at which we can now prototype and iterate is incredible.",
    author: "Alex Thompson",
    position: "Lead Developer, TechForward"
  },
  {
    image: "/lovable-uploads/b12f72ef-c1b0-4777-957e-dc822586abbf.png",
    quote: "Since implementing Bright Candy, our team's productivity has doubled. It's like having an extra developer on the team.",
    author: "Sarah Chen",
    position: "Project Manager, InnovateCo"
  },
  {
    image: "/lovable-uploads/43b9ba27-ee97-4b46-b16b-769724b8443f.png",
    quote: "Bright Candy's intuitive interface and powerful features have revolutionized how we build web applications.",
    author: "Emma Wilson",
    position: "CTO, Digital Solutions Ltd"
  },
  {
    image: "/lovable-uploads/71d80dcd-73ab-43a1-994c-d453fe9987e2.png",
    quote: "I was skeptical at first, but Bright Candy has become our secret weapon for rapid development. It's simply amazing.",
    author: "Marcus Rodriguez",
    position: "Senior Developer, WebCraft"
  },
  {
    image: "/lovable-uploads/d393ec05-0cdc-402c-a61f-83d945f13973.png",
    quote: "Our clients are amazed by how quickly we can deliver high-quality web applications. Bright Candy is a game-changer.",
    author: "Jasmine Taylor",
    position: "Product Lead, Innovative Studio"
  }
];

export const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="relative h-full">
      <div className="absolute inset-0">
        <img
          src={testimonials[currentIndex].image}
          alt="Testimonial"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
      </div>
      
      <div className="absolute bottom-12 left-12 right-12 text-white">
        <p className="text-3xl font-medium mb-8 leading-normal">
          "{testimonials[currentIndex].quote}"
        </p>
        <div className="space-y-2">
          <p className="text-2xl font-semibold">{testimonials[currentIndex].author}</p>
          <p className="text-lg text-white/80">{testimonials[currentIndex].position}</p>
        </div>
        <div className="flex gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 hover:bg-white/20"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 hover:bg-white/20"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};
