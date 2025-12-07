"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
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
import { Link2, Plus, Loader2 } from "lucide-react";

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

interface LinkCreationFormProps {
  onSubmit: (values: FormValues) => Promise<void>;
  submitting: boolean;
  onError?: (error: Error) => void;
}

export function LinkCreationForm({
  onSubmit,
  submitting,
  onError,
}: LinkCreationFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      alias: "",
      description: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      if (error instanceof Error && error.message === "Alias already exists") {
        form.setError("alias", { message: "Alias already exists" });
      } else if (onError) {
        onError(
          error instanceof Error ? error : new Error("An error occurred")
        );
      }
    }
  };

  return (
    <Card className="lg:col-span-4 border-none bg-surface-container-high/50 backdrop-blur-xl rounded-3xl overflow-hidden relative group h-full">
      <div className="p-8 md:p-12 bg-surface-container-highest/30 flex flex-col justify-center h-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 max-w-md mx-auto w-full"
          >
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
                        className="pl-10 h-14 rounded-2xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        {...field}
                      />
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
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
                      <span className="text-xl font-medium font-mono">
                        go<span className="text-primary">/</span>
                      </span>
                      <Input
                        placeholder="google"
                        className="font-mono text-lg h-14 rounded-2xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                      className="h-14 rounded-2xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              size="lg"
              className="px-12 w-auto h-18 text-xl font-semibold rounded-full bg-primary hover:bg-primary/90 text-on-primary transition-all"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 w-8 h-8 animate-spin" />
              ) : (
                <Plus className="mr-2 w-8 h-8" />
              )}
              {submitting ? "Creating..." : "Create Link"}
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
