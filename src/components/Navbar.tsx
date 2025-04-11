
import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const Navbar = ({ className }: { className?: string }) => {
  return (
    <header className={cn("w-full border-b bg-background", className)}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <Link to="/" className="text-xl font-bold text-foreground">
            Sistema de Monitoramento
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/historico" 
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            Histórico
          </Link>
        </div>
        
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] pt-12">
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-foreground/60 hover:text-foreground transition-colors px-3 py-2"
              >
                Dashboard
              </Link>
              <Link 
                to="/historico" 
                className="text-foreground/60 hover:text-foreground transition-colors px-3 py-2"
              >
                Histórico
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
