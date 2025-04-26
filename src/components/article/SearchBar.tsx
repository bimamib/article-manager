
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceTime?: number;
  initialValue?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search articles...",
  debounceTime = 500,
  initialValue = "",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialValue);

  const debouncedSearch = useCallback(
    (value: string) => {
      const handler = setTimeout(() => {
        onSearch(value);
      }, debounceTime);

      return () => {
        clearTimeout(handler);
      };
    },
    [onSearch, debounceTime]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(searchTerm);
    return cleanup;
  }, [searchTerm, debouncedSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
