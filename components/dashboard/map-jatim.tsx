"use client"

import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import L from "leaflet"
L.Icon.Default.imagePath = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/"

interface MapJatimProps {
  data: { nama: string; produksi: number }[]
  isLoading: boolean
}

const normalizeName = (nameStr: string): string => {
  if (!nameStr) return ""
  let normalized = nameStr.toLowerCase()
  
  // 1. Seragamkan singkatan menjadi kata penuh
  normalized = normalized.replace(/kab\.|kab /g, "kabupaten ")
  normalized = normalized.replace(/kot\.|kota /g, "kota ")
  
  // 2. Hapus karakter non-alfanumerik KECUALI spasi (untuk pemisah)
  // lalu hapus spasi berlebih
  return normalized
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default function MapJatim({ data, isLoading }: MapJatimProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [errorGeo, setErrorGeo] = useState<boolean>(false)

  // Access Token Jawg.io Anda
  const JAWG_ACCESS_TOKEN = "rwZqcZi5ObZOxVeLWmnU2PNUv1Rr5BZeW5IlJUgwQV9B7FQTISOUstxjW08TtU4u"

  useEffect(() => {
    fetch("/geojson/Provinsi Jawa Timur-KAB_KOTA.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil file GeoJSON")
        return res.json()
      })
      .then((json) => setGeoJsonData(json))
      .catch((err) => {
        console.error("Error GeoJSON:", err)
        setErrorGeo(true)
      })
  }, [])

  // SEDERHANA: Menjadi 4 Tingkatan Saja
  const getColor = (produksi: number) => {
    return produksi > 8000 ? "#1b5e20" : // 4. Tinggi (Hijau Tua)
           produksi > 1500 ? "#43a047" : // 3. Sedang (Hijau)
           produksi > 0    ? "#a5d6a7" : // 2. Rendah (Hijau Muda)
                             "#ffffff"   // 1. Nol / Tidak Ada Data (Putih)
  }

  const getStyle = (feature: any) => {
    const geoKabKota = feature.properties.kab_kota || ""
    const geoNamaFull = feature.properties.nama || ""

    const matchedRegion = data.find((r) => {
      const dbNameNormalized = normalizeName(r.nama)
      return (
        dbNameNormalized === normalizeName(geoKabKota) ||
        dbNameNormalized === normalizeName(geoNamaFull)
      )
    })

    const produksiValue = matchedRegion ? matchedRegion.produksi : 0

    return {
      fillColor: getColor(produksiValue),
      weight: 1,
      opacity: 1,
      color: "#423254",
      dashArray: "",
      fillOpacity: 0.75,
    }
  }

  const onEachFeature = (feature: any, layer: any) => {
    const geoKabKota = feature.properties.kab_kota || ""
    const geoNamaFull = feature.properties.nama || ""

    const matchedRegion = data.find((r) => {
      const dbNameNormalized = normalizeName(r.nama)
      return (
        dbNameNormalized === normalizeName(geoKabKota) ||
        dbNameNormalized === normalizeName(geoNamaFull)
      )
    })

    const produksiValue = matchedRegion ? matchedRegion.produksi : 0

    layer.on({
      mouseover: (e: any) => {
        const l = e.target
        l.setStyle({
          weight: 2,
          color: "#1d142b",
          fillOpacity: 0.9,
        })
        l.bringToFront()
      },
      mouseout: (e: any) => {
        const l = e.target
        l.setStyle({
          weight: 1,
          color: "#423254",
          fillOpacity: 0.75,
        })
      },
    })

    layer.bindTooltip(
      `<div class="p-1 font-sans text-xs">
        <strong class="text-slate-800 text-sm block border-b pb-1 mb-1">${feature.properties.nama}</strong>
        <span class="text-slate-600">Volume Produksi:</span> 
        <strong class="text-red-700">${produksiValue.toLocaleString("id-ID")} ton</strong>
      </div>`,
      { sticky: true, direction: "top", opacity: 0.95 }
    )
  }

  if (isLoading || (!geoJsonData && !errorGeo)) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Memuat peta spasial...</p>
        </div>
      </div>
    )
  }

  if (errorGeo) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center rounded-2xl bg-red-50/50 border border-red-100 p-6 text-center text-sm text-red-600">
        Gagal memuat file peta wilayah (.geojson).
      </div>
    )
  }

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-2xl border border-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      <MapContainer
        center={[-7.75, 112.75]}
        zoom={7.5}
        scrollWheelZoom={false}
        className="h-full w-full z-0 bg-[#a3c9e6]"
      >
        <TileLayer
          attribution='<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={`https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=${JAWG_ACCESS_TOKEN}`}
          minZoom={0}
          maxZoom={22}
        />

        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* LEGENDA BERSIH 4 TINGKATAN */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-slate-200 font-sans text-[10px] text-slate-700 flex flex-col gap-1.5">
        <span className="font-bold border-b pb-1 text-slate-900">Produksi (Ton)</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#1b5e20] opacity-80 border border-black/30"></div>
          <span>&gt; 8.000</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#43a047] opacity-80 border border-black/30"></div>
          <span>1.501 - 8.000</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#a5d6a7] opacity-80 border border-black/30"></div>
          <span>1 - 1.500</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#ffffff] border border-slate-300"></div>
          <span>0 / Tidak ada data</span>
        </div>
      </div>
    </div>
  )
}