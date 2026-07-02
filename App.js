import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  Animated,
  TextInput,
  ScrollView,
  Image,
} from "react-native";

const { height } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 64;
const SCREEN_HEIGHT = height - TAB_BAR_HEIGHT;

/* ================= DATA ================= */
const INITIAL_CLIPS = [
  { id: "1", title: "1v2 Deep Wildy Clutch", type: "NH", tag: "Deep Wildy", desc: "Pure clutch fight", likes: 12 },
  { id: "2", title: "Max AGS Combo", type: "PURE", tag: "Combo", desc: "One-tap AGS finish", likes: 44 },
  { id: "3", title: "Clan fight domination", type: "CLAN", tag: "Multi PK", desc: "Wipe pile instantly", likes: 31 },
  { id: "4", title: "Perfect spec timing", type: "VENG", tag: "Clutch", desc: "Frame perfect KO", likes: 18 },
];

const FILTERS = ["ALL", "NH", "PURE", "CLAN", "VENG"];

/* ================= OSRS PROFILE SYSTEM ================= */
function getLevel(uploadCount) {
  return Math.min(99, Math.floor(Math.sqrt(uploadCount) * 12));
}

function getTitle(level) {
  if (level >= 99) return "PKVault MAXED LEGEND";
  if (level >= 85) return "Deep Wild Veteran";
  if (level >= 60) return "High Risk Specialist";
  if (level >= 30) return "Wilderness Fighter";
  if (level >= 10) return "Edge Pker";
  return "Ditch Recruit";
}

function getBadges(uploadCount, likes) {
  const badges = [];
  if (uploadCount >= 1) badges.push("💀 First Upload");
  if (uploadCount >= 5) badges.push("⚔️ 5 Clips");
  if (uploadCount >= 10) badges.push("🔥 10 Clips");
  if (likes >= 50) badges.push("❤️ Popular PKer");
  if (likes >= 150) badges.push("📈 Viral Potential");
  return badges;
}

/* ================= APP ================= */
export default function App() {
  const [tab, setTab] = useState("home");
  const [filter, setFilter] = useState("ALL");
  const [clips, setClips] = useState(INITIAL_CLIPS);
  const [profilePic, setProfilePic] = useState("");
  const [picInput, setPicInput] = useState("");
  const [videoInput, setVideoInput] = useState("");
  const [hearts, setHearts] = useState([]);

  const bigHeart = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  const totalUploads = clips.length;
  const totalLikes = clips.reduce((s, c) => s + (c.likes || 0), 0);

  const level = getLevel(totalUploads);
  const title = getTitle(level);
  const badges = getBadges(totalUploads, totalLikes);

  /* ================= LIKE ================= */
  const toggleLike = useCallback((id) => {
    setClips((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
          : c
      )
    );
  }, []);

  const filteredHome = useMemo(() => {
    if (filter === "ALL") return clips;
    return clips.filter((c) => c.type === filter);
  }, [filter, clips]);

  /* ================= HEART ================= */
  const triggerHeart = () => {
    bigHeart.setValue(0);
    Animated.sequence([
      Animated.spring(bigHeart, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(bigHeart, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const spawnHearts = () => {
    const id = Math.random().toString();
    const anim = new Animated.Value(0);

    setHearts((p) => [...p, { id, anim }]);

    Animated.timing(anim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start(() => {
      setHearts((p) => p.filter((h) => h.id !== id));
    });
  };

  const renderHearts = () =>
    hearts.map((h) => (
      <Animated.Text
        key={h.id}
        style={{
          position: "absolute",
          fontSize: 24,
          opacity: h.anim,
          transform: [
            { translateY: h.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -180] }) },
            { scale: h.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1.3, 0.8] }) },
          ],
        }}
      >
        ❤️
      </Animated.Text>
    ));

  /* ================= KO ================= */
  const KOs = () => (
    <View style={{ flex: 1, backgroundColor: "#000" }}>

      <FlatList
        data={clips}
        keyExtractor={(i) => i.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onMomentumScrollEnd={() => {
          progress.setValue(0);
          Animated.timing(progress, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: false,
          }).start();
        }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              triggerHeart();
              spawnHearts();
              toggleLike(item.id);
            }}
            style={{
              height: SCREEN_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 18 }}>{item.title}</Text>
            <Text style={{ color: "#888", marginTop: 6 }}>
              {item.type} • {item.tag}
            </Text>

            <Animated.Text
              style={{
                position: "absolute",
                fontSize: 90,
                opacity: bigHeart.interpolate({
                  inputRange: [0, 0.2, 1],
                  outputRange: [0, 1, 0],
                }),
                zIndex: 5,
              }}
            >
              ❤️
            </Animated.Text>

            {renderHearts()}

            <View
              style={{
                position: "absolute",
                right: 14,
                bottom: TAB_BAR_HEIGHT + 120,
                zIndex: 10,
              }}
            >
              <Text style={{ fontSize: 24 }}>
                {item.liked ? "❤️" : "🤍"}
              </Text>
              <Text style={{ fontSize: 24, marginTop: 18 }}>💬</Text>
              <Text style={{ fontSize: 24, marginTop: 18 }}>🔗</Text>
            </View>
          </Pressable>
        )}
      />

      {/* 🔥 STABLE PROGRESS BAR */}
      <View
        style={{
          position: "absolute",
          bottom: TAB_BAR_HEIGHT,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: "#222",
        }}
      >
        <Animated.View
          style={{
            height: 3,
            backgroundColor: "#00ff88",
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          }}
        />
      </View>
    </View>
  );

  /* ================= PROFILE ================= */
  const Profile = () => (
    <ScrollView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <View style={{ alignItems: "center", marginTop: 60 }}>
        <View style={{ width: 90, height: 90, borderRadius: 45, overflow: "hidden", backgroundColor: "#222" }}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={{ width: 90, height: 90 }} />
          ) : (
            <Text style={{ color: "#666", marginTop: 35, textAlign: "center" }}>No Pic</Text>
          )}
        </View>

        <Text style={{ color: "white", fontSize: 22, marginTop: 10 }}>
          Level {level}
        </Text>
        <Text style={{ color: "#aaa" }}>{title}</Text>

        <Text style={{ color: "#888", marginTop: 10 }}>
          Uploads: {totalUploads} • Likes: {totalLikes}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 15 }}>
          {badges.map((b, i) => (
            <View key={i} style={{ backgroundColor: "#151515", padding: 8, margin: 4, borderRadius: 10 }}>
              <Text style={{ color: "#fff", fontSize: 12 }}>{b}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  /* ================= TAB ================= */
  const TabButton = ({ icon, label, active }) => (
    <Pressable
      onPress={() => setTab(label.toLowerCase())}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={{ fontSize: 18, color: active ? "#00ff88" : "#fff" }}>
        {icon === "KO" ? "☠️" : icon}
      </Text>
      <Text style={{ fontSize: 10, color: active ? "#00ff88" : "#777" }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      {tab === "home" && <View style={{ flex: 1, backgroundColor: "#0a0a0a" }} />}
      {tab === "kos" && <KOs />}
      {tab === "browse" && <View style={{ flex: 1, backgroundColor: "#0a0a0a" }} />}
      {tab === "subs" && <View style={{ flex: 1, backgroundColor: "#0a0a0a" }} />}
      {tab === "profile" && <Profile />}

      <View style={{ flexDirection: "row", height: TAB_BAR_HEIGHT, backgroundColor: "#0a0a0a", borderTopWidth: 1, borderColor: "#1f1f1f" }}>
        <TabButton icon="🏠" label="Home" active={tab === "home"} />
        <TabButton icon="🔍" label="Browse" active={tab === "browse"} />
        <TabButton icon="KO" label="KOs" active={tab === "kos"} />
        <TabButton icon="❤️" label="Subs" active={tab === "subs"} />
        <TabButton icon="👤" label="Profile" active={tab === "profile"} />
      </View>
    </View>
  );
}
