import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import SidebarLayout from './sidebar'
import { Button } from './ui/button'
import illustration from '../assets/404-illustration.png'

export default function NotFound() {
  return (
    <SidebarLayout>
      <div className="flex flex-col items-center justify-center min-h-full p-6 text-center bg-background text-foreground animate-in fade-in duration-500">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center max-w-lg mx-auto"
        >
          <div className="relative w-full max-w-[320px] aspect-square mb-8">
             <motion.img 
              src={illustration} 
              alt="404 Illustration" 
              className="w-full h-full object-contain drop-shadow-xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />
            {/* Subtle glow behind the image to blend */}
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full -z-10" />
          </div>

          <p className="font-semibold text-primary/80 mb-2">404: Page Not Found</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Destination Unknown
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-sm">
            We couldn't locate the route you're looking for. It might have been canceled or rescheduled.
          </p>

          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/">
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </SidebarLayout>
  )
}
