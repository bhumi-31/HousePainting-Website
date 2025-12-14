import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, Palette } from "lucide-react";

export const ProjectDetailModal = ({ project, open, onOpenChange }) => {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">
            {project.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Before/After Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Before</span>
              <img
                src={project.beforeImage}
                alt={`${project.title} - Before`}
                className="w-full aspect-[4/3] object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">After</span>
              <img
                src={project.afterImage}
                alt={`${project.title} - After`}
                className="w-full aspect-[4/3] object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <p className="text-muted-foreground">{project.description}</p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>Duration: {project.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-primary" />
                <span>{project.viewCount || project.views} views</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Colors used:</span>
              <div className="flex gap-2">
                {project.colors?.map((color) => (
                  <Badge key={color} variant="secondary">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
