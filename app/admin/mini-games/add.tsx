/* eslint-disable import/order */
"use client";
import { TopicFormData, topicSchema } from "@/app/models/TopicDTO";
import loading from "@/components/loading";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateTopic } from "@/hooks/use-topic-hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
type AddTopicModalProps = {
  onClose: () => void;
};

const AddTopicModal = ({ onClose }: AddTopicModalProps) => {
  const createTopic = useCreateTopic();
  const form = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
  });

  const onSubmit = async (data: TopicFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("icon", data.icon);
    await createTopic.mutateAsync(formData);
    onClose();
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      form.setValue("icon", file);
                      field.onChange(file);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" className="w-32">
            {createTopic.isPending ? <Loading /> : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddTopicModal;
