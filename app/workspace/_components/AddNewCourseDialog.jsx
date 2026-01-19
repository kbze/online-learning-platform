import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Sparkle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function AddNewCourseDialog({ children }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    includeVideo: false,
    noOfChapters: 1,
    category: "",
    level: "",
  });

  const router = useRouter();

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onGenerate = async () => {
    if (!formData.name || !formData.level) {
      toast.error("Course name and level are required");
      return;
    }

    const courseId = uuidv4();

    const payload = {
      courseId,
      name: formData.name,
      description: formData.description,
      includeVideo: formData.includeVideo,
      noOfChapters: formData.noOfChapters,
      category: formData.category,
      level: formData.level,
    };

    try {
      setLoading(true);

      const result = await axios.post(
        "/api/generate-course-layout",
        payload
      );

      // 🔴 VERY IMPORTANT
      if (result.data?.resp === "limit exceed") {
        toast.warning("Please subscribe to a plan");
        router.push("/workspace/billing");
        return; // ⛔ STOP HERE
      }

      if (result.data?.courseId) {
        router.push("/workspace/edit-course/" + result.data.courseId);
      }
    } catch (e) {
      console.error(e?.response?.data || e);
      toast.error("Failed to generate course");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>

          <DialogDescription asChild>
            <div className="flex flex-col gap-4 mt-3">
              <Input
                placeholder="Course Name"
                onChange={(e) =>
                  onHandleInputChange("name", e.target.value)
                }
              />

              <Textarea
                placeholder="Description"
                onChange={(e) =>
                  onHandleInputChange("description", e.target.value)
                }
              />

              <Input
                type="number"
                min={1}
                placeholder="Number of chapters"
                onChange={(e) =>
                  onHandleInputChange(
                    "noOfChapters",
                    Number(e.target.value)
                  )
                }
              />

              <div className="flex items-center gap-3">
                <label>Include Video</label>
                <Switch
                  onCheckedChange={(val) =>
                    onHandleInputChange("includeVideo", val)
                  }
                />
              </div>

              <Select
                onValueChange={(val) =>
                  onHandleInputChange("level", val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Category"
                onChange={(e) =>
                  onHandleInputChange("category", e.target.value)
                }
              />

              <Button
                onClick={onGenerate}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Sparkle />
                )}
                Generate Course
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewCourseDialog;
