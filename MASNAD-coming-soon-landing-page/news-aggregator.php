<?php
// news-aggregator.php
// Free RSS aggregator with caching (headlines only).
// Usage: include this file and call get_latest_news()

function get_latest_news($maxItems = 18, $cacheMinutes = 20) {
  $cacheDir = __DIR__ . "/cache";
  $cacheFile = $cacheDir . "/news_cache.json";

  if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
  }

  // If cache is fresh, return it
  if (file_exists($cacheFile)) {
    $ageSeconds = time() - filemtime($cacheFile);
    if ($ageSeconds < ($cacheMinutes * 60)) {
      $cached = json_decode(file_get_contents($cacheFile), true);
      if (is_array($cached)) return array_slice($cached, 0, $maxItems);
    }
  }

  // ✅ Add / remove RSS feeds here (headlines + link only)
  $feeds = [
    ["name" => "Reuters", "url" => "https://feeds.reuters.com/reuters/businessNews"],
    ["name" => "CNBC",    "url" => "https://www.cnbc.com/id/100003114/device/rss/rss.html"],
    ["name" => "Investing", "url" => "https://www.investing.com/rss/news_25.rss"],
    ["name" => "Financial Times", "url" => "https://www.ft.com/?format=rss"],
    ["name" => "The Economist", "url" => "https://www.economist.com/finance-and-economics/rss.xml"],
  ];

  $items = [];

  foreach ($feeds as $feed) {
    $xmlString = fetch_url($feed["url"]);
    if (!$xmlString) continue;

    $xml = @simplexml_load_string($xmlString, "SimpleXMLElement", LIBXML_NOCDATA);
    if (!$xml) continue;

    // RSS usually: $xml->channel->item
    if (isset($xml->channel->item)) {
      foreach ($xml->channel->item as $it) {
        $title = trim((string)$it->title);
        $link  = trim((string)$it->link);
        $date  = (string)$it->pubDate;

        if (!$title || !$link) continue;

        $timestamp = strtotime($date);
        if (!$timestamp) $timestamp = time();

        $items[] = [
          "title" => $title,
          "link" => $link,
          "source" => $feed["name"],
          "timestamp" => $timestamp
        ];
      }
    }

    // Atom feeds: $xml->entry
    if (isset($xml->entry)) {
      foreach ($xml->entry as $entry) {
        $title = trim((string)$entry->title);
        $link = "";
        if (isset($entry->link)) {
          foreach ($entry->link as $lnk) {
            $attrs = $lnk->attributes();
            if (isset($attrs["href"])) { $link = (string)$attrs["href"]; break; }
          }
        }
        $date = (string)($entry->updated ?? $entry->published);

        if (!$title || !$link) continue;

        $timestamp = strtotime($date);
        if (!$timestamp) $timestamp = time();

        $items[] = [
          "title" => $title,
          "link" => $link,
          "source" => $feed["name"],
          "timestamp" => $timestamp
        ];
      }
    }
  }

  // Sort newest first
  usort($items, function($a, $b) { return $b["timestamp"] <=> $a["timestamp"]; });

  // Remove duplicates by title+link
  $seen = [];
  $unique = [];
  foreach ($items as $it) {
    $key = md5($it["title"] . "|" . $it["link"]);
    if (isset($seen[$key])) continue;
    $seen[$key] = true;
    $unique[] = $it;
  }

  // Save cache
  @file_put_contents($cacheFile, json_encode($unique));

  return array_slice($unique, 0, $maxItems);
}

function fetch_url($url) {
  $context = stream_context_create([
    "http" => [
      "method" => "GET",
      "timeout" => 8,
      "header" => "User-Agent: MasnadNewsBot/1.0\r\n"
    ]
  ]);
  $data = @file_get_contents($url, false, $context);
  return $data ?: null;
}
