
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
    image: "/lovable-uploads/7b4ac80f-3404-471b-a0b1-9b4145491e2f.png",
    quote: "Bright Candy has saved us thousands of hours of work. We're able to spin up projects faster and take on more clients.",
    author: "Lulu Meyers",
    position: "Product Manager, Some Corporation"
  },
  {
    image: "/lovable-uploads/2d171e6f-6024-48d6-819f-e0e0ff779332.png",
    quote: "Bright Candy has saved us thousands of hours of work. We're able to spin up projects faster and take on more clients.",
    author: "Josh Summers",
    position: "Sales Manager, Some Corporation"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
