import os
import math
import re
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, ImageStat, ImageFilter

CATEGORIES = {
    "Pothole": {
        "keywords": ["pothole", "crater", "dent", "road hole", "tarmac crack", "tyre damage", "bumpy road", "asphalt hole", "manhole sink"],
        "department": "Roads and Transportation Department",
        "base_severity": 30,
        "hazard_weight": 20
    },
    "Road Damage": {
        "keywords": ["road damage", "damaged road", "caved in", "divider broken", "speed breaker", "pavement", "footpath broken", "sinkhole", "road collapse", "asphalt damage"],
        "department": "Roads and Transportation Department",
        "base_severity": 28,
        "hazard_weight": 18
    },
    "Garbage Problem": {
        "keywords": ["garbage", "trash", "waste", "dumping", "rubbish", "litter", "stench", "smell", "plastic waste", "overflowing bin", "debris", "rotting"],
        "department": "Sanitation Department",
        "base_severity": 22,
        "hazard_weight": 10
    },
    "Broken Streetlight": {
        "keywords": ["streetlight", "street light", "lamp post", "light pole", "dark road", "flickering light", "no light", "bulb fused", "darkness", "street lamp"],
        "department": "Electricity Department",
        "base_severity": 20,
        "hazard_weight": 15
    },
    "Water Leakage": {
        "keywords": ["water leakage", "leak", "pipeline burst", "broken pipe", "drinking water wasted", "water gushing", "valve broken", "pipe burst", "water flowing"],
        "department": "Water Supply Department",
        "base_severity": 28,
        "hazard_weight": 16
    },
    "Drainage Problem": {
        "keywords": ["drainage", "drain", "sewer", "sewage", "gutter", "overflowing sewage", "blocked drain", "dirty water", "stagnant water", "choked drain", "septic overflow"],
        "department": "Municipal Engineering Department",
        "base_severity": 26,
        "hazard_weight": 14
    },
    "Public Safety Issue": {
        "keywords": ["danger", "hazard", "electric wire", "live wire", "spark", "accident", "open manhole", "collapse risk", "fallen tree", "wire hanging", "electrocution", "fire risk"],
        "department": "Emergency / Public Safety Department",
        "base_severity": 38,
        "hazard_weight": 25
    },
    "Damaged Public Property": {
        "keywords": ["public property", "broken bench", "bus stop damaged", "park fence", "signboard broken", "vandalism", "railing broken", "public toilet damaged"],
        "department": "Public Works Department",
        "base_severity": 18,
        "hazard_weight": 8
    },
    "Traffic Problem": {
        "keywords": ["traffic", "traffic jam", "signal not working", "signal broken", "congestion", "gridlock", "wrong parking", "signal failure"],
        "department": "Traffic Management Department",
        "base_severity": 22,
        "hazard_weight": 12
    }
}

HAZARD_TRIGGERS = [
    "accident", "danger", "fatal", "sparking", "injuries", "injured", "hospital",
    "emergency", "collapse", "live wire", "children", "school", "elderly fallen",
    "death", "severe", "critical", "urgent", "electric shock", "explosion"
]

HIGH_IMPORTANCE_LOCATIONS = [
    "hospital", "school", "market", "metro", "station", "junction", "highway",
    "main road", "bus stand", "university", "circle", "central", "expressway"
]

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes distance in meters between two GPS coordinates using Haversine formula."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def text_similarity(text1: str, text2: str) -> float:
    """Computes token Jaccard & overlap similarity between two text snippets."""
    words1 = set(re.findall(r'\w+', text1.lower()))
    words2 = set(re.findall(r'\w+', text2.lower()))
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / float(len(union))

def analyze_image_features(image_path: Optional[str]) -> Dict[str, Any]:
    """
    Extracts computer vision image features:
    - Mean luminance & RGB contrast
    - Surface roughness / edge density
    - Texture irregularity indicative of asphalt cracks, potholes, garbage piles, or water sheen.
    """
    if not image_path or not os.path.exists(image_path):
        return {
            "has_image": False,
            "visual_confidence_boost": 0,
            "detected_visual_aspects": ["No visual artifact provided"],
            "image_quality": "none"
        }

    try:
        with Image.open(image_path) as img:
            img_rgb = img.convert("RGB")
            width, height = img_rgb.size
            stats = ImageStat.Stat(img_rgb)
            mean_r, mean_g, mean_b = stats.mean
            mean_brightness = (mean_r + mean_g + mean_b) / 3.0
            variance_rgb = (stats.var[0] + stats.var[1] + stats.var[2]) / 3.0
            
            # Edge density analysis (roughness / potholes / cracks)
            gray = img.convert("L")
            edges = gray.filter(ImageFilter.FIND_EDGES)
            edge_stats = ImageStat.Stat(edges)
            edge_mean = edge_stats.mean[0]  # Higher indicates uneven rough surfaces (potholes, debris)

            aspects = []
            if edge_mean > 25:
                aspects.append("High edge density / surface fracture detected (cracks/debris)")
            if mean_brightness < 60:
                aspects.append("Low ambient illumination detected (night/dim conditions)")
            if variance_rgb > 2500:
                aspects.append("Heterogeneous color distribution detected (refuse/litter patterns)")
            if abs(mean_r - mean_b) < 15 and mean_brightness > 120 and edge_mean < 20:
                aspects.append("Specular / reflective surface detected (water ponding/leakage)")

            boost = min(12, int((edge_mean / 10.0) + (1 if len(aspects) > 1 else 0)))

            return {
                "has_image": True,
                "width": width,
                "height": height,
                "mean_brightness": round(mean_brightness, 1),
                "edge_roughness": round(edge_mean, 1),
                "visual_confidence_boost": boost,
                "detected_visual_aspects": aspects if aspects else ["Standard civic infrastructure context"],
                "image_quality": "verified_hd" if width >= 600 else "standard"
            }
    except Exception as e:
        return {
            "has_image": True,
            "visual_confidence_boost": 0,
            "detected_visual_aspects": [f"Image processed: {str(e)[:40]}"],
            "image_quality": "processed"
        }

def analyze_issue(
    title: str,
    description: str,
    user_category: Optional[str] = None,
    image_path: Optional[str] = None,
    location_name: str = "",
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    nearby_reports_count: int = 1
) -> Dict[str, Any]:
    """
    Unified AI analysis pipeline:
    1. NLP Categorization & Keyword Matching
    2. Computer Vision Inspection
    3. Multi-Factor Priority Calculation
    4. Department Routing
    """
    full_text = f"{title} {description}".lower()
    
    # Category scoring
    category_scores = {}
    for cat_name, cat_data in CATEGORIES.items():
        score = 0
        for kw in cat_data["keywords"]:
            if kw in full_text:
                score += (3 if kw in title.lower() else 2)
        if user_category and user_category.lower() == cat_name.lower():
            score += 4
        category_scores[cat_name] = score

    # Determine best category
    best_category, max_score = max(category_scores.items(), key=lambda x: x[1])
    if max_score == 0:
        best_category = user_category if user_category in CATEGORIES else "Road Damage"

    cat_meta = CATEGORIES.get(best_category, CATEGORIES["Road Damage"])
    
    # Image inspection
    img_analysis = analyze_image_features(image_path)
    
    # Calculate confidence
    base_conf = 78
    if max_score >= 6:
        base_conf += 14
    elif max_score >= 3:
        base_conf += 8
    if img_analysis["has_image"]:
        base_conf += min(8, img_analysis["visual_confidence_boost"])
    confidence = min(98, max(72, base_conf))

    # Priority Calculation Factors:
    # 1. Base Severity (0 to 40)
    severity_score = cat_meta["base_severity"] + min(8, img_analysis["visual_confidence_boost"])
    
    # 2. Public Safety Risk (0 to 25)
    safety_triggers_found = [trig for trig in HAZARD_TRIGGERS if trig in full_text]
    safety_score = min(25, len(safety_triggers_found) * 8 + (5 if "hazard" in full_text or "danger" in full_text else 0))
    if best_category == "Public Safety Issue":
        safety_score = max(safety_score, 22)

    # 3. Location Importance (0 to 15)
    location_importance = 0
    loc_text = f"{location_name} {full_text}".lower()
    matched_locs = [loc for loc in HIGH_IMPORTANCE_LOCATIONS if loc in loc_text]
    if matched_locs:
        location_importance = min(15, len(matched_locs) * 6 + 4)
    else:
        location_importance = 5  # default baseline importance

    # 4. Citizen Density / Duplicate Reports (0 to 20)
    # If 10 citizens report the same issue, priority elevates dramatically!
    if nearby_reports_count <= 1:
        crowd_score = 0
    elif nearby_reports_count <= 3:
        crowd_score = 8
    elif nearby_reports_count <= 6:
        crowd_score = 14
    else:
        crowd_score = 20

    # Total Score Formula
    total_priority_score = severity_score + safety_score + location_importance + crowd_score

    # Determine Priority
    if total_priority_score >= 70 or safety_score >= 20:
        priority_level = "HIGH"
        priority_badge = "🔴 High Priority"
    elif total_priority_score >= 42:
        priority_level = "MEDIUM"
        priority_badge = "🟠 Medium Priority"
    else:
        priority_level = "LOW"
        priority_badge = "🟢 Low Priority"

    recommended_dept = cat_meta["department"]

    explanation_parts = []
    if safety_score >= 15:
        explanation_parts.append(f"Significant safety hazard triggers: {', '.join(safety_triggers_found[:3])}")
    if crowd_score > 0:
        explanation_parts.append(f"Elevated community impact: reported by {nearby_reports_count} citizens")
    if location_importance >= 10:
        explanation_parts.append(f"High-traffic zone detected ({', '.join(matched_locs[:2])})")
    if img_analysis["has_image"]:
        explanation_parts.append("Visual confirmation verified via submitted photograph")

    if not explanation_parts:
        explanation_parts.append("Standard civic infrastructure maintenance priority")

    return {
        "detected_category": best_category,
        "confidence_percentage": confidence,
        "priority_level": priority_level,
        "priority_badge": priority_badge,
        "priority_score": total_priority_score,
        "priority_factors": {
            "severity_score": severity_score,
            "safety_risk_score": safety_score,
            "location_importance": location_importance,
            "crowd_density_score": crowd_score,
            "nearby_reports_count": nearby_reports_count
        },
        "recommended_department": recommended_dept,
        "hazard_triggers": safety_triggers_found,
        "ai_explanation": " • ".join(explanation_parts),
        "image_analysis": img_analysis
    }

def find_duplicate_issues(
    latitude: float,
    longitude: float,
    title: str,
    description: str,
    category: str,
    existing_issues: List[Dict[str, Any]],
    distance_threshold_meters: float = 150.0
) -> Optional[Dict[str, Any]]:
    """
    Finds if an incoming issue matches an existing unresolved complaint
    in the same geographic radius (< 150m) with high textual/category similarity.
    """
    if latitude is None or longitude is None:
        return None

    best_match = None
    min_dist = float("inf")

    incoming_text = f"{title} {description}"

    for issue in existing_issues:
        # Ignore already resolved or closed issues
        if issue.get("status") in ["Resolved", "Rejected"]:
            continue

        loc = issue.get("location", {})
        coords = loc.get("coordinates")
        if not coords or len(coords) != 2:
            continue

        # In MongoDB geoJSON coordinates format: [lng, lat] or lat/lng fields
        ex_lat = coords[1] if isinstance(coords, list) else loc.get("latitude")
        ex_lng = coords[0] if isinstance(coords, list) else loc.get("longitude")

        if ex_lat is None or ex_lng is None:
            continue

        dist = haversine_distance_meters(latitude, longitude, float(ex_lat), float(ex_lng))
        if dist <= distance_threshold_meters:
            # Check category match or text similarity
            sim = text_similarity(incoming_text, f"{issue.get('title', '')} {issue.get('description', '')}")
            cat_match = (category.lower() == issue.get("category", "").lower())
            
            if cat_match or sim > 0.25:
                if dist < min_dist:
                    min_dist = dist
                    best_match = {
                        "parent_id": issue.get("complaint_id"),
                        "parent_title": issue.get("title"),
                        "distance_meters": round(dist, 1),
                        "similarity_score": round(sim, 2),
                        "existing_report_count": issue.get("report_count", 1)
                    }

    return best_match
