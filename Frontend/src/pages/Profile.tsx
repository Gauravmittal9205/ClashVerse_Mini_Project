import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Calendar, Trophy, Code, Edit2, Save, X } from "lucide-react";
import Navbar from "@/components/Navbar";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  birthDate: z.string().optional(),
  programmingLanguages: z.array(z.string()).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  githubUsername: z.string().optional(),
  linkedinProfile: z.string().optional(),
  website: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    username: "",
    email: "",
    fullName: "",
    bio: "",
    phone: "",
    location: "",
    birthDate: "",
    programmingLanguages: [],
    experienceLevel: "beginner",
    githubUsername: "",
    linkedinProfile: "",
    website: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileData,
  });

  useEffect(() => {
    // Load saved profile data from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileData(parsed);
      reset(parsed);
    } else {
      // Set default values for demo
      const defaultData = {
        username: "coder_" + Math.floor(Math.random() * 1000),
        email: "user@example.com",
        fullName: "John Doe",
        bio: "Passionate coder and problem solver",
        location: "San Francisco, CA",
        experienceLevel: "intermediate" as const,
        programmingLanguages: ["JavaScript", "TypeScript", "Python"],
      };
      setProfileData(defaultData);
      reset(defaultData);
    }
  }, [reset]);

  const watchedLanguages = watch("programmingLanguages") || [];

  const handleAddLanguage = (language: string) => {
    if (language && !watchedLanguages.includes(language)) {
      setValue("programmingLanguages", [...watchedLanguages, language]);
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setValue("programmingLanguages", watchedLanguages.filter(lang => lang !== language));
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem("userProfile", JSON.stringify(data));
      setProfileData(data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset(profileData);
    setIsEditing(false);
  };

  const commonLanguages = ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin"];

  return (
    <>
      <Navbar />
      <div className="container mx-auto pt-28 pb-8 px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty || isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Manage your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.username}`} />
                  <AvatarFallback>{profileData.fullName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{profileData.fullName}</h3>
                  <p className="text-muted-foreground">@{profileData.username}</p>
                  <Badge variant="secondary" className="mt-1">
                    {profileData.experienceLevel}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      {...register("fullName")}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profileData.fullName || "Not set"}</p>
                  )}
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      {...register("username")}
                      placeholder="Enter username"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">@{profileData.username}</p>
                  )}
                  {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{profileData.email}</p>
                    </div>
                  )}
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{profileData.phone || "Not set"}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{profileData.location || "Not set"}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  {isEditing ? (
                    <Input
                      id="birthDate"
                      type="date"
                      {...register("birthDate")}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{profileData.birthDate || "Not set"}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{profileData.bio || "No bio added"}</p>
                )}
                {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Your coding skills and professional background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Programming Languages</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    <Select onValueChange={handleAddLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add programming language" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonLanguages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2">
                      {watchedLanguages.map((lang) => (
                        <Badge key={lang} variant="default" className="cursor-pointer" onClick={() => handleRemoveLanguage(lang)}>
                          {lang} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(profileData.programmingLanguages ?? []).length > 0 ? (
                      (profileData.programmingLanguages ?? []).map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No languages added</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                {isEditing ? (
                  <Select {...register("experienceLevel")} onValueChange={(value) => setValue("experienceLevel", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">{profileData.experienceLevel}</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="githubUsername">GitHub Username</Label>
                  {isEditing ? (
                    <Input
                      id="githubUsername"
                      {...register("githubUsername")}
                      placeholder="Enter GitHub username"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profileData.githubUsername || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  {isEditing ? (
                    <Input
                      id="linkedinProfile"
                      {...register("linkedinProfile")}
                      placeholder="Enter LinkedIn profile URL"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profileData.linkedinProfile || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Personal Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      {...register("website")}
                      placeholder="Enter your website URL"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profileData.website || "Not set"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievements & Stats
              </CardTitle>
              <CardDescription>
                Your coding accomplishments and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">42</div>
                  <div className="text-sm text-muted-foreground">Battles Won</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">128</div>
                  <div className="text-sm text-muted-foreground">Problems Solved</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">89%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">Recent Achievements</h3>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2">🏆 Code Master</Badge>
                  <Badge variant="outline" className="mr-2">⚡ Speed Coder</Badge>
                  <Badge variant="outline" className="mr-2">🎯 Problem Solver</Badge>
                  <Badge variant="outline" className="mr-2">🔥 30 Day Streak</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
};

export default Profile;
