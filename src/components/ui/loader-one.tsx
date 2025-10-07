import { motion } from "framer-motion";

const LoaderOne = () => {
  return (
    <div className="flex items-center justify-center gap-1">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="h-3 w-3 rounded-full bg-primary"
          initial={{ x: 0 }}
          animate={{
            x: [0, 8, 0],
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />
      ))}
    </div>
  );
};

export default LoaderOne;
