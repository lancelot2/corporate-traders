// Reusable image directions. Keep identity-sensitive prompts explicit so they
// can be paired with a supplied reference image and an appropriate fal model.
export const imagePresets = {
  'simpson-headshot': {
    model: 'bytedance/seedream/v5/lite/edit',
    imageSize: 'portrait_4_3',
    prompt: `Generate a headshot of the same person from the input image, preserving their identity and likeness exactly. Apply this uniform treatment to keep all profile pictures visually consistent.

Style: The Simpsons character style.
Pose & angle: Head and shoulders, slightly angled and smiling.
Background: Solid, clean, light monochrome background.
Quality: High-resolution and realistic.`,
  },
};
