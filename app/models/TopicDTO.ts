import { z } from "zod";

type TopicDTO = {
  id: number;
  title: string;
  icon: string;
};

export const topicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  icon: z
    .custom<File>((val) => val instanceof File, {
      message: "Icon file is required",
    })
    .refine((file) => file?.type.startsWith("image/"), {
      message: "Icon must be an image",
    }),
});

export type TopicFormData = z.infer<typeof topicSchema>;

export default TopicDTO;
