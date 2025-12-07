"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link2, Loader2 } from "lucide-react";
import type { LinkData } from "@/lib/api/links";
import { useUpdateLink } from "@/lib/hooks/use-links";
import { toast } from "sonner";

const formSchema = z.object({
  destination: z.string().url({
    message: "Please enter a valid URL.",
  }),
  alias: z
    .string()
    .min(2, {
      message: "Alias must be at least 2 characters.",
    })
    .refine((val) => !val.includes("/") && !val.startsWith("-"), {
      message: "Alias cannot contain '/' or starts with '-'",
    }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditLinkDialogProps {
  link: LinkData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLinkDialog({
  link,
  open,
  onOpenChange,
}: EditLinkDialogProps) {
  const updateLinkMutation = useUpdateLink();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: link.url,
      alias: link.shortCode,
      description: link.description || "",
    },
  });

  // Reset form when link changes or dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        destination: link.url,
        alias: link.shortCode,
        description: link.description || "",
      });
    }
  }, [open, link, form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      // Only send fields that have changed
      const updateParams: {
        url?: string;
        shortCode?: string;
        description?: string;
      } = {};

      if (values.destination !== link.url) {
        updateParams.url = values.destination;
      }
      if (values.alias !== link.shortCode) {
        updateParams.shortCode = values.alias;
      }
      if (values.description !== (link.description || "")) {
        updateParams.description = values.description || undefined;
      }

      // Only call API if something changed
      if (Object.keys(updateParams).length > 0) {
        await updateLinkMutation.mutateAsync({
          id: link.id,
          params: updateParams,
        });
        toast.success("Link updated successfully");
        onOpenChange(false);
      } else {
        // Nothing changed, just close
        onOpenChange(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Alias already exists") {
          form.setError("alias", { message: "Alias already exists" });
        } else {
          toast.error(error.message || "Failed to update link");
        }
      } else {
        toast.error("Failed to update link");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>
            Update the link details. Changes will be reflected immediately.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">
                    Destination
                  </FormLabel>
                  <FormControl>
                    <div className="relative group/input">
                      <Input
                        placeholder="https://google.com"
                        className="pl-10 h-12 rounded-xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        {...field}
                      />
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">
                    Short Alias
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-primary font-mono">
                        go/
                      </span>
                      <Input
                        placeholder="google"
                        className="font-mono text-base h-12 rounded-xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-variant">
                    Description{" "}
                    <span className="text-muted-foreground text-xs font-normal ml-1">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Project roadmap and timeline"
                      className="h-12 rounded-xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outlined"
                onClick={() => onOpenChange(false)}
                disabled={updateLinkMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateLinkMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-on-primary"
              >
                {updateLinkMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

