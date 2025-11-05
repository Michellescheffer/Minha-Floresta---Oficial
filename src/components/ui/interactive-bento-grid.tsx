import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../components/ui/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
  isActive = false,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-xl transition-all duration-300 p-4 bg-white/60 backdrop-blur-md border border-white/30 justify-between flex flex-col space-y-4 cursor-pointer relative overflow-hidden",
        className,
        isActive && "ring-2 ring-green-500/50 bg-green-50/60",
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeInOut" }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-green-500/5 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-3xl border-2 border-transparent"
        style={{
          background: isHovered 
            ? "linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.3), transparent) border-box"
            : "transparent",
        }}
        animate={{
          borderColor: isHovered ? "rgba(34, 197, 94, 0.3)" : "transparent",
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        {header}
        <div className="group-hover/bento:translate-x-2 transition-transform duration-300">
          {icon && (
            <motion.div 
              className="mb-2 text-green-600"
              animate={{
                rotate: isHovered ? 5 : 0,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
          
          <div className="mb-2 mt-2">
            {typeof title === 'string' ? (
              <h4 className="glass-heading-card">{title}</h4>
            ) : (
              title
            )}
          </div>
          
          <motion.div 
            className="font-sans font-normal text-gray-600 text-sm leading-relaxed"
            animate={{
              opacity: isHovered ? 0.9 : 0.7,
            }}
            transition={{ duration: 0.2 }}
          >
            {description}
          </motion.div>
        </div>
      </div>

      {/* Floating particles effect */}
      <motion.div
        className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full opacity-0"
        animate={{
          opacity: isHovered ? [0, 1, 0] : 0,
          scale: isHovered ? [1, 1.5, 1] : 1,
          y: isHovered ? [-10, -20, -10] : 0,
        }}
        transition={{
          duration: 2,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full opacity-0"
        animate={{
          opacity: isHovered ? [0, 1, 0] : 0,
          scale: isHovered ? [1, 2, 1] : 1,
          y: isHovered ? [-5, -15, -5] : 0,
        }}
        transition={{
          duration: 1.5,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />
    </motion.div>
  );
};

// Special variant for larger feature cards
export const BentoGridFeature = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
  children,
  isActive = false,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
  isActive?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        "md:col-span-2 md:row-span-2 rounded-3xl group/bento hover:shadow-2xl transition-all duration-300 p-6 bg-white/70 backdrop-blur-lg border border-white/40 justify-between flex flex-col space-y-6 cursor-pointer relative overflow-hidden",
        className,
        isActive && "ring-2 ring-green-500/50 bg-green-50/70",
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Enhanced background effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Multiple floating elements */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute w-1 h-1 rounded-full opacity-0",
            i % 3 === 0 ? "bg-green-400" : i % 3 === 1 ? "bg-blue-400" : "bg-purple-400"
          )}
          style={{
            top: `${20 + i * 15}%`,
            right: `${10 + i * 10}%`,
          }}
          animate={{
            opacity: isHovered ? [0, 0.8, 0] : 0,
            scale: isHovered ? [1, 2, 1] : 1,
            y: isHovered ? [0, -20, 0] : 0,
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: isHovered ? Infinity : 0,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

      <div className="relative z-10 flex-1">
        {header}
        <div className="group-hover/bento:translate-x-2 transition-transform duration-300">
          {icon && (
            <motion.div 
              className="mb-4 text-green-600"
              animate={{
                rotate: isHovered ? 10 : 0,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
          )}
          
          <motion.div 
            className="mb-4"
            animate={{
              color: isHovered ? "rgb(34, 197, 94)" : "rgb(31, 41, 55)",
            }}
            transition={{ duration: 0.3 }}
          >
            {typeof title === 'string' ? (
              <h3 className="glass-heading-tertiary">{title}</h3>
            ) : (
              title
            )}
          </motion.div>
          
          <motion.div 
            className="font-sans font-normal text-gray-600 leading-relaxed mb-4"
            animate={{
              opacity: isHovered ? 1 : 0.8,
            }}
            transition={{ duration: 0.2 }}
          >
            {description}
          </motion.div>
          
          {children}
        </div>
      </div>
    </motion.div>
  );
};