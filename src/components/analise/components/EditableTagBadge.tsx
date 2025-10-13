import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pencil, Loader2 } from 'lucide-react';
import { useIsMasterUser } from '@/hooks/useIsMasterUser';
import { useUpdateConversationTag } from '@/hooks/useUpdateConversationTag';
import { cn } from '@/lib/utils';

interface EditableTagBadgeProps {
  conversationId: number;
  currentTag: string;
  onTagUpdated?: (newTag: string) => void;
}

const TAGS = [
  'T1 - NOVO LEAD',
  'T2 - QUALIFICANDO',
  'T3 - QUALIFICADO',
  'T4 - FOLLOW-UP',
  'T5 - DESQUALIFICADO'
] as const;

const tagColors: Record<string, string> = {
  "T1 - NOVO LEAD": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "T2 - QUALIFICANDO": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "T3 - QUALIFICADO": "bg-green-500/10 text-green-400 border-green-500/30",
  "T4 - FOLLOW-UP": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "T5 - DESQUALIFICADO": "bg-red-500/10 text-red-400 border-red-500/30"
};

export const EditableTagBadge = ({ conversationId, currentTag, onTagUpdated }: EditableTagBadgeProps) => {
  const { isMaster, isLoading: isMasterLoading } = useIsMasterUser();
  const { updateTag, isUpdating } = useUpdateConversationTag();
  const [isOpen, setIsOpen] = useState(false);

  const handleTagSelect = async (newTag: string) => {
    if (newTag === currentTag) {
      setIsOpen(false);
      return;
    }

    const result = await updateTag(conversationId, newTag);
    
    if (result.success) {
      onTagUpdated?.(newTag);
      setIsOpen(false);
    }
  };

  const badgeClassName = tagColors[currentTag] || "bg-muted text-muted-foreground";

  if (isMasterLoading) {
    return (
      <Badge className={badgeClassName}>
        {currentTag}
      </Badge>
    );
  }

  if (!isMaster) {
    return (
      <Badge className={badgeClassName}>
        {currentTag}
      </Badge>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="group relative">
          <Badge className={cn(badgeClassName, "cursor-pointer hover:opacity-80 transition-opacity pr-7")}>
            {currentTag}
            <Pencil className="ml-1.5 h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2" align="start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Selecionar Tag</p>
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              disabled={isUpdating}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                currentTag === tag && "bg-accent",
                isUpdating && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between">
                <span>{tag}</span>
                {isUpdating && currentTag === tag && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
