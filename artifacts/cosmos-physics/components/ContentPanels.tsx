import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import { apiRequestUploadUrl } from "@/lib/apiClient";

type Colors = ReturnType<typeof useColors>;

export function FormCard({
  colors,
  title,
  badge,
  children,
}: {
  colors: Colors;
  title: string;
  badge?: { label: string; onPress: () => void };
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={[styles.formTitle, { color: colors.foreground }]}>{title}</Text>
        {badge ? (
          <Pressable onPress={badge.onPress}>
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 11 }}>
              {badge.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View style={{ gap: 10, marginTop: 10 }}>{children}</View>
    </View>
  );
}

export function Field({
  colors,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  secureTextEntry,
}: {
  colors: Colors;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad" | "email-address";
  multiline?: boolean;
  secureTextEntry?: boolean;
}) {
  return (
    <View>
      {label ? (
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.fieldWrap,
          {
            backgroundColor: colors.muted,
            borderColor: colors.border,
            paddingVertical: multiline ? 10 : 0,
            minHeight: multiline ? 90 : 46,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType ?? "default"}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          autoCapitalize={keyboardType === "email-address" ? "none" : undefined}
          style={[
            styles.fieldInput,
            { color: colors.foreground, textAlignVertical: multiline ? "top" : "center" },
          ]}
        />
      </View>
    </View>
  );
}

export function ItemRow({
  colors,
  title,
  subtitle,
  badge,
  onEdit,
  onRemove,
  isEditing,
}: {
  colors: Colors;
  title: string;
  subtitle: string;
  badge?: string;
  onEdit?: () => void;
  onRemove?: () => void;
  isEditing?: boolean;
}) {
  return (
    <View
      style={[
        styles.itemRow,
        {
          backgroundColor: colors.card,
          borderColor: isEditing ? colors.primary : colors.border,
          borderWidth: isEditing ? 2 : 1,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.itemSub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {subtitle}
        </Text>
        {badge ? (
          <View style={[styles.itemBadge, { backgroundColor: colors.secondary }]}>
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 10 }}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      {onEdit ? (
        <Pressable
          onPress={onEdit}
          style={[styles.smallBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name={isEditing ? "edit-3" : "edit-2"} size={14} color={colors.primary} />
        </Pressable>
      ) : null}
      {onRemove ? (
        <Pressable
          onPress={() =>
            Alert.alert("Remove", `Remove "${title}"?`, [
              { text: "Cancel", style: "cancel" },
              { text: "Remove", style: "destructive", onPress: onRemove },
            ])
          }
          style={[styles.smallBtn, { backgroundColor: "rgba(255,84,112,0.16)" }]}
        >
          <Feather name="trash-2" size={14} color={colors.destructive} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function ChipRow<T extends string>({
  colors,
  options,
  value,
  onChange,
  capitalize,
}: {
  colors: Colors;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  capitalize?: boolean;
}) {
  return (
    <View style={styles.levelRow}>
      {options.map((o) => {
        const active = value === o;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            style={[
              styles.lvlChip,
              {
                backgroundColor: active ? colors.primary : "transparent",
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: active ? "#FFFFFF" : colors.mutedForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 11,
                textTransform: capitalize ? "capitalize" : "none",
              }}
            >
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const COURSE_LEVELS = ["Class 9-10", "Class 11-12", "JEE/NEET", "Engineering"] as const;
const COURSE_ICONS = ["book", "zap", "activity", "thermometer", "radio", "cpu", "eye", "wind"] as const;
const GRADIENTS: Record<string, [string, string]> = {
  book: ["#5B8CFF", "#8B5CF6"],
  zap: ["#FF8A4C", "#FF5470"],
  activity: ["#34D399", "#10B981"],
  thermometer: ["#F59E0B", "#EF4444"],
  radio: ["#8B5CF6", "#EC4899"],
  cpu: ["#06B6D4", "#3B82F6"],
  eye: ["#A78BFA", "#7C3AED"],
  wind: ["#34D399", "#06B6D4"],
};

export function CoursesPanel({
  colors,
  items,
  onAdd,
  onUpdate,
  onRemove,
  createdBy,
  scopedTitle,
}: {
  colors: Colors;
  items: any[];
  onAdd: (c: any) => void;
  onUpdate?: (id: string, partial: any) => void;
  onRemove: (id: string) => void;
  createdBy?: string;
  scopedTitle?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<(typeof COURSE_LEVELS)[number]>("JEE/NEET");
  const [price, setPrice] = useState("999");
  const [youtubePlaylistUrl, setYoutubePlaylistUrl] = useState("");
  const [icon, setIcon] = useState<(typeof COURSE_ICONS)[number]>("book");

  useEffect(() => {
    if (!editingId) return;
    const item = items.find((i) => i.id === editingId);
    if (!item) return;
    setTitle(item.title);
    setSubtitle(item.subtitle ?? "");
    setDescription(item.description ?? "");
    setLevel(item.level ?? "JEE/NEET");
    setPrice(String(item.price ?? 999));
    setYoutubePlaylistUrl(item.youtubePlaylistUrl ?? "");
    setIcon(item.icon ?? "book");
  }, [editingId, items]);

  const reset = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setDescription("");
    setLevel("JEE/NEET");
    setPrice("999");
    setYoutubePlaylistUrl("");
    setIcon("book");
  };

  const submit = () => {
    if (!title.trim()) {
      Alert.alert("Add a course title to continue");
      return;
    }
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || "Physics",
      description: description.trim() || "A comprehensive physics course.",
      level,
      icon,
      gradient: GRADIENTS[icon] ?? ["#5B8CFF", "#8B5CF6"],
      price: parseInt(price, 10) || 0,
      youtubePlaylistUrl: youtubePlaylistUrl.trim() || undefined,
      rating: 4.8,
      students: 0,
      lessons: 0,
      hours: 0,
      chapters: [],
    };
    if (editingId && onUpdate) onUpdate(editingId, payload);
    else onAdd({ ...payload, createdBy });
    reset();
  };

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
      <FormCard
        colors={colors}
        title={editingId ? "Edit Course" : "Add a Course"}
        badge={editingId ? { label: "Cancel edit", onPress: reset } : undefined}
      >
        <Field colors={colors} label="Course title" value={title} onChangeText={setTitle} placeholder="e.g. Modern Physics" />
        <Field colors={colors} label="Subtitle / tagline" value={subtitle} onChangeText={setSubtitle} placeholder="e.g. Quantum, Atoms & Radiation" />
        <Field colors={colors} label="Description" value={description} onChangeText={setDescription} multiline placeholder="What will students learn?" />
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Level</Text>
          <ChipRow colors={colors} options={COURSE_LEVELS} value={level} onChange={setLevel} />
        </View>
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Icon</Text>
          <View style={styles.levelRow}>
            {COURSE_ICONS.map((ic) => {
              const active = icon === ic;
              return (
                <Pressable
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={[
                    styles.iconChip,
                    {
                      backgroundColor: active ? colors.primary : "transparent",
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather name={ic as never} size={14} color={active ? "#FFFFFF" : colors.mutedForeground} />
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Price ₹" value={price} onChangeText={setPrice} keyboardType="number-pad" />
          </View>
        </View>
        <Field
          colors={colors}
          label="YouTube Playlist URL (optional)"
          value={youtubePlaylistUrl}
          onChangeText={setYoutubePlaylistUrl}
          placeholder="https://youtube.com/playlist?list=..."
        />
        <PrimaryButton
          label={editingId ? "Save Changes" : "Create Course"}
          icon={editingId ? "save" : "plus"}
          onPress={submit}
        />
      </FormCard>

      <Text style={[styles.section, { color: colors.foreground, marginTop: 8 }]}>
        {scopedTitle ?? "All Courses"} ({items.length})
      </Text>
      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No courses created yet.
        </Text>
      ) : null}
      {items.map((c) => (
        <ItemRow
          key={c.id}
          colors={colors}
          title={c.title}
          subtitle={`${c.level} · ₹${c.price}`}
          isEditing={editingId === c.id}
          onEdit={onUpdate ? () => setEditingId(editingId === c.id ? null : c.id) : undefined}
          onRemove={() => onRemove(c.id)}
        />
      ))}
    </View>
  );
}

export function LivePanel({
  colors,
  items,
  onAdd,
  onUpdate,
  onRemove,
  defaultFaculty = "Md Zafar Alam",
  createdBy,
  scopedTitle,
}: {
  colors: Colors;
  items: any[];
  onAdd: (c: any) => void;
  onUpdate?: (id: string, partial: any) => void;
  onRemove: (id: string) => void;
  defaultFaculty?: string;
  createdBy?: string;
  scopedTitle?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("Tomorrow");
  const [time, setTime] = useState("7:00 PM IST");
  const [duration, setDuration] = useState("60");
  const [meetUrl, setMeetUrl] = useState("https://meet.google.com/cosmos-");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    if (!editingId) return;
    const item = items.find((i) => i.id === editingId);
    if (!item) return;
    setTitle(item.title);
    setTopic(item.topic);
    setDate(item.date);
    setTime(item.time);
    setDuration(String(item.durationMinutes));
    setMeetUrl(item.meetUrl);
    setYoutubeUrl(item.youtubeUrl ?? "");
  }, [editingId, items]);

  const reset = () => {
    setEditingId(null);
    setTitle("");
    setTopic("");
    setDate("Tomorrow");
    setTime("7:00 PM IST");
    setDuration("60");
    setMeetUrl("https://meet.google.com/cosmos-");
    setYoutubeUrl("");
  };

  const submit = () => {
    if (!title.trim()) {
      Alert.alert("Add a class title to continue");
      return;
    }
    const payload = {
      title: title.trim(),
      topic: topic.trim() || "Physics",
      faculty: defaultFaculty,
      date: date.trim(),
      time: time.trim(),
      durationMinutes: parseInt(duration, 10) || 60,
      meetUrl: meetUrl.trim(),
      youtubeUrl: youtubeUrl.trim() || undefined,
    };
    if (editingId && onUpdate) onUpdate(editingId, payload);
    else onAdd({ ...payload, enrolled: 0, isLive: false, createdBy });
    reset();
  };

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
      <FormCard
        colors={colors}
        title={editingId ? "Edit Live Class" : "Schedule a Live Class"}
        badge={editingId ? { label: "Cancel edit", onPress: reset } : undefined}
      >
        <Field colors={colors} label="Class title" value={title} onChangeText={setTitle} placeholder="e.g. Wave Optics PYQ Marathon" />
        <Field colors={colors} label="Topic" value={topic} onChangeText={setTopic} placeholder="e.g. Optics" />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Date" value={date} onChangeText={setDate} />
          </View>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Time" value={time} onChangeText={setTime} />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Duration (min)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 2 }}>
            <Field colors={colors} label="Google Meet URL" value={meetUrl} onChangeText={setMeetUrl} />
          </View>
        </View>
        <Field
          colors={colors}
          label="YouTube Recording URL (optional)"
          value={youtubeUrl}
          onChangeText={setYoutubeUrl}
          placeholder="https://youtube.com/watch?v=..."
        />
        <PrimaryButton
          label={editingId ? "Save Changes" : "Schedule Class"}
          icon={editingId ? "save" : "calendar"}
          onPress={submit}
        />
      </FormCard>

      <Text style={[styles.section, { color: colors.foreground, marginTop: 8 }]}>
        {scopedTitle ?? "All Live Classes"} ({items.length})
      </Text>
      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No classes scheduled yet.
        </Text>
      ) : null}
      {items.map((c) => (
        <ItemRow
          key={c.id}
          colors={colors}
          title={c.title}
          subtitle={`${c.date} · ${c.time} · ${c.topic}`}
          badge={c.isLive ? "LIVE" : undefined}
          isEditing={editingId === c.id}
          onEdit={onUpdate ? () => setEditingId(editingId === c.id ? null : c.id) : undefined}
          onRemove={() => onRemove(c.id)}
        />
      ))}
    </View>
  );
}

export function QuizPanel({
  colors,
  items,
  onAdd,
  onUpdate,
  onRemove,
  createdBy,
  scopedTitle,
}: {
  colors: Colors;
  items: any[];
  onAdd: (q: any) => void;
  onUpdate?: (id: string, partial: any) => void;
  onRemove: (id: string) => void;
  createdBy?: string;
  scopedTitle?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("10");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [question, setQuestion] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (!editingId) return;
    const item = items.find((i) => i.id === editingId);
    if (!item) return;
    setTitle(item.title);
    setTopic(item.topic);
    setDuration(String(item.durationMinutes));
    setDifficulty(item.difficulty);
    const q = item.questions?.[0];
    if (q) {
      setQuestion(q.question);
      const padded = [...q.options];
      while (padded.length < 4) padded.push("");
      setOpts(padded.slice(0, 4));
      setCorrect(q.correctIndex);
      setExplanation(q.explanation || "");
    }
  }, [editingId, items]);

  const reset = () => {
    setEditingId(null);
    setTitle("");
    setTopic("");
    setDuration("10");
    setDifficulty("Medium");
    setQuestion("");
    setOpts(["", "", "", ""]);
    setCorrect(0);
    setExplanation("");
  };

  const submit = () => {
    if (!title.trim() || !question.trim() || opts.some((o) => !o.trim())) {
      Alert.alert("Fill the title, the question, and all 4 options.");
      return;
    }
    const payload = {
      title: title.trim(),
      topic: topic.trim() || "Physics",
      courseId: "mechanics",
      difficulty,
      durationMinutes: parseInt(duration, 10) || 10,
      questions: [
        {
          id: "q1",
          question: question.trim(),
          options: opts.map((o) => o.trim()),
          correctIndex: correct,
          explanation: explanation.trim() || "—",
        },
      ],
    };
    if (editingId && onUpdate) onUpdate(editingId, payload);
    else onAdd({ ...payload, createdBy });
    reset();
  };

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
      <FormCard
        colors={colors}
        title={editingId ? "Edit Quiz" : "Create a Quiz (1 sample question)"}
        badge={editingId ? { label: "Cancel edit", onPress: reset } : undefined}
      >
        <Field colors={colors} label="Quiz title" value={title} onChangeText={setTitle} placeholder="e.g. Magnetism Quick Test" />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 2 }}>
            <Field colors={colors} label="Topic" value={topic} onChangeText={setTopic} />
          </View>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Duration" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
          </View>
        </View>
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Difficulty</Text>
          <ChipRow colors={colors} options={["Easy", "Medium", "Hard"] as const} value={difficulty} onChange={setDifficulty} />
        </View>
        <Field colors={colors} label="Question" value={question} onChangeText={setQuestion} multiline />
        {opts.map((o, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Field
                colors={colors}
                label={`Option ${String.fromCharCode(65 + i)}`}
                value={o}
                onChangeText={(v) => setOpts((arr) => arr.map((x, idx) => (idx === i ? v : x)))}
              />
            </View>
            <Pressable
              onPress={() => setCorrect(i)}
              style={[
                styles.correctChip,
                {
                  backgroundColor: correct === i ? "#34D399" : "transparent",
                  borderColor: correct === i ? "#34D399" : colors.border,
                },
              ]}
            >
              <Feather
                name={correct === i ? "check-circle" : "circle"}
                size={14}
                color={correct === i ? "#FFFFFF" : colors.mutedForeground}
              />
              <Text
                style={{
                  color: correct === i ? "#FFFFFF" : colors.mutedForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 11,
                }}
              >
                Correct
              </Text>
            </Pressable>
          </View>
        ))}
        <Field colors={colors} label="Explanation" value={explanation} onChangeText={setExplanation} multiline />
        <PrimaryButton
          label={editingId ? "Save Changes" : "Create Quiz"}
          icon={editingId ? "save" : "plus"}
          onPress={submit}
        />
      </FormCard>

      <Text style={[styles.section, { color: colors.foreground, marginTop: 8 }]}>
        {scopedTitle ?? "All Quizzes"} ({items.length})
      </Text>
      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No quizzes created yet.
        </Text>
      ) : null}
      {items.map((q) => (
        <ItemRow
          key={q.id}
          colors={colors}
          title={q.title}
          subtitle={`${q.topic} · ${q.questions.length} Qs · ${q.difficulty}`}
          isEditing={editingId === q.id}
          onEdit={onUpdate ? () => setEditingId(editingId === q.id ? null : q.id) : undefined}
          onRemove={() => onRemove(q.id)}
        />
      ))}
    </View>
  );
}

export function NotesPanel({
  colors,
  items,
  onAdd,
  onUpdate,
  onRemove,
  createdBy,
  scopedTitle,
}: {
  colors: Colors;
  items: any[];
  onAdd: (r: any) => void;
  onUpdate?: (id: string, partial: any) => void;
  onRemove: (id: string) => void;
  createdBy?: string;
  scopedTitle?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [pages, setPages] = useState("12");
  const [size, setSize] = useState("0.8 MB");
  const [category, setCategory] =
    useState<"Notes" | "Formula Sheet" | "PYQ" | "Numerical Sheet">("Notes");
  const [driveUrl, setDriveUrl] = useState("");
  const [pdfObjectPath, setPdfObjectPath] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "picking" | "uploading" | "done">("idle");
  const [uploadPct, setUploadPct] = useState(0);

  useEffect(() => {
    if (!editingId) return;
    const item = items.find((i) => i.id === editingId);
    if (!item) return;
    setTitle(item.title);
    setTopic(item.topic);
    setPages(String(item.pages));
    setSize(item.size);
    setCategory(item.category);
    setDriveUrl(item.driveUrl ?? "");
    setPdfObjectPath(item.pdfObjectPath ?? "");
  }, [editingId, items]);

  const reset = () => {
    setEditingId(null);
    setTitle("");
    setTopic("");
    setPages("12");
    setSize("0.8 MB");
    setCategory("Notes");
    setDriveUrl("");
    setPdfObjectPath("");
    setUploadStatus("idle");
    setUploadPct(0);
  };

  const pickAndUpload = async () => {
    setUploadStatus("picking");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) {
        setUploadStatus("idle");
        return;
      }
      const file = result.assets[0];
      setUploadStatus("uploading");
      setUploadPct(0);
      const { uploadURL, objectPath } = await apiRequestUploadUrl(
        file.name,
        file.size ?? 0,
        "application/pdf",
      );
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", "application/pdf");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Upload failed: " + xhr.status)));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send({ uri: file.uri } as unknown as BodyInit);
      });
      setPdfObjectPath(objectPath);
      const kb = file.size ? Math.round(file.size / 1024) : 0;
      setSize(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
      setUploadStatus("done");
      Alert.alert("Uploaded!", `${file.name} is ready.`);
    } catch (err: unknown) {
      setUploadStatus("idle");
      Alert.alert("Upload failed", err instanceof Error ? err.message : "Please try again.");
    }
  };

  const submit = () => {
    if (!title.trim()) {
      Alert.alert("Add a title to continue");
      return;
    }
    const payload = {
      title: title.trim(),
      category,
      pages: parseInt(pages, 10) || 1,
      size: size.trim() || "1 MB",
      topic: topic.trim() || "All Chapters",
      driveUrl: driveUrl.trim() || undefined,
      pdfObjectPath: pdfObjectPath.trim() || undefined,
    };
    if (editingId && onUpdate) onUpdate(editingId, payload);
    else onAdd({ ...payload, createdBy });
    reset();
  };

  const uploadLabel =
    uploadStatus === "picking"
      ? "Choosing file…"
      : uploadStatus === "uploading"
        ? `Uploading… ${uploadPct}%`
        : uploadStatus === "done"
          ? "PDF uploaded ✓ — tap to replace"
          : pdfObjectPath
            ? "PDF attached — tap to replace"
            : "Attach PDF from device";

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
      <FormCard
        colors={colors}
        title={editingId ? "Edit Material" : "Upload Study Material"}
        badge={editingId ? { label: "Cancel edit", onPress: reset } : undefined}
      >
        <Field colors={colors} label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Magnetism Class Notes" />
        <Field colors={colors} label="Topic" value={topic} onChangeText={setTopic} placeholder="e.g. Electricity & Magnetism" />
        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
          <ChipRow
            colors={colors}
            options={["Notes", "Formula Sheet", "PYQ", "Numerical Sheet"] as const}
            value={category}
            onChange={setCategory}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="Pages" value={pages} onChangeText={setPages} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Field colors={colors} label="File size" value={size} onChangeText={setSize} />
          </View>
        </View>

        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>PDF file (upload)</Text>
          <Pressable
            onPress={pickAndUpload}
            disabled={uploadStatus === "uploading" || uploadStatus === "picking"}
            style={[
              styles.uploadBtn,
              {
                backgroundColor: uploadStatus === "done" || pdfObjectPath
                  ? "rgba(52,211,153,0.12)"
                  : colors.muted,
                borderColor: uploadStatus === "done" || pdfObjectPath
                  ? "#34D399"
                  : colors.border,
              },
            ]}
          >
            <Feather
              name={uploadStatus === "done" || pdfObjectPath ? "check-circle" : "upload-cloud"}
              size={16}
              color={uploadStatus === "done" || pdfObjectPath ? "#34D399" : colors.mutedForeground}
            />
            <Text
              style={{
                color: uploadStatus === "done" || pdfObjectPath ? "#34D399" : colors.mutedForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {uploadLabel}
            </Text>
          </Pressable>
        </View>

        <View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            Google Drive / external URL (optional)
          </Text>
          <View style={[styles.fieldWrap, { backgroundColor: colors.muted, borderColor: colors.border, paddingVertical: 0, minHeight: 46 }]}>
            <Feather name="link" size={14} color={colors.mutedForeground} style={{ marginLeft: 0 }} />
            <TextInput
              value={driveUrl}
              onChangeText={setDriveUrl}
              placeholder="https://drive.google.com/…"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              keyboardType="url"
              style={[styles.fieldInput, { color: colors.foreground }]}
            />
          </View>
        </View>

        <PrimaryButton
          label={editingId ? "Save Changes" : "Add to Library"}
          icon={editingId ? "save" : "upload"}
          onPress={submit}
        />
      </FormCard>

      <Text style={[styles.section, { color: colors.foreground, marginTop: 8 }]}>
        {scopedTitle ?? "All Resources"} ({items.length})
      </Text>
      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No materials uploaded yet.
        </Text>
      ) : null}
      {items.map((r) => (
        <ItemRow
          key={r.id}
          colors={colors}
          title={r.title}
          subtitle={`${r.category} · ${r.topic} · ${r.pages} pages${r.pdfObjectPath ? " · PDF" : r.driveUrl ? " · Drive" : ""}`}
          isEditing={editingId === r.id}
          onEdit={onUpdate ? () => setEditingId(editingId === r.id ? null : r.id) : undefined}
          onRemove={() => onRemove(r.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: { padding: 16, borderRadius: 18, borderWidth: 1 },
  formTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  fieldLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  fieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  fieldInput: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14 },
  levelRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  lvlChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  correctChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
  },
  section: { fontFamily: "Inter_700Bold", fontSize: 16, letterSpacing: -0.3 },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
  },
  itemTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  itemSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  itemBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
  },
  smallBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
});
