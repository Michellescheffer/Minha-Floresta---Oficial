import { cn } from "./utils";
import { motion } from "motion/react";

interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
  impact: string;
  type: string;
}

interface TestimonialsColumnsProps {
  testimonials: TestimonialItem[];
  className?: string;
}

export function TestimonialsColumns({ testimonials, className }: TestimonialsColumnsProps) {
  // Split testimonials into columns for masonry effect
  const columns = [
    testimonials.filter((_, i) => i % 3 === 0),
    testimonials.filter((_, i) => i % 3 === 1), 
    testimonials.filter((_, i) => i % 3 === 2),
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'corporate':
        return 'text-blue-600 bg-blue-50';
      case 'individual':
        return 'text-green-600 bg-green-50';
      case 'partner':
        return 'text-purple-600 bg-purple-50';
      case 'community':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'corporate':
        return 'Corporativo';
      case 'individual':
        return 'Individual';
      case 'partner':
        return 'Parceiro';
      case 'community':
        return 'Comunidade';
      default:
        return 'Cliente';
    }
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="space-y-6">
          {column.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: columnIndex * 0.1 + index * 0.1 
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {/* Header with avatar and info */}
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {testimonial.role}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      getTypeColor(testimonial.type)
                    )}>
                      {getTypeLabel(testimonial.type)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-500 ml-2">
                  ({testimonial.rating}.0)
                </span>
              </div>

              {/* Testimonial text */}
              <blockquote className="text-gray-700 leading-relaxed mb-4 relative">
                <svg
                  className="absolute -top-2 -left-2 w-6 h-6 text-green-500/20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
                <p className="relative z-10 text-sm italic">
                  "{testimonial.text}"
                </p>
              </blockquote>

              {/* Footer with company and impact */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {testimonial.company}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      {testimonial.impact}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover effect gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}