"use client"

import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import L from "leaflet"
L.Icon.Default.imagePath = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/"

interface MapHargaProps {
  data: { nama: string; harga: number }[]
  isLoading: boolean
  selectedYear?: string
  selectedMonth?: string
}

const normalizeName = (nameStr: string): string => {
  if (!nameStr) return ""
  let normalized = nameStr.toLowerCase()
  
  normalized = normalized.replace(/kab\.|kab /g, "kabupaten ")
  normalized = normalized.replace(/kot\.|kota /g, "kota ")
  
  return normalized
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default function MapHarga({ data, isLoading, selectedYear, selectedMonth }: MapHargaProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [errorGeo, setErrorGeo] = useState<boolean>(false)

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

  const getColor = (harga: number) => {
    if (!harga || harga <= 0) return "#ffffff" 
    if (harga < 10500) return "#ef4444" 
    if (harga < 11000) return "#f97316" 
    if (harga < 12500) return "#86efac" 
    if (harga < 14000) return "#22c55e" 
    return "#15803d" 
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

    const hargaValue = matchedRegion ? matchedRegion.harga : 0
    const isZero = hargaValue === 0

    return {
      fillColor: getColor(hargaValue),
      weight: isZero ? 1 : 1.2,
      opacity: 1,
      color: isZero ? "#e2e8f0" : "#065f46", // Border abu-abu tipis jika kosong
      dashArray: "",
      fillOpacity: isZero ? 0.5 : 0.85,     // Opacity sangat ringan jika kosong
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

    const hargaValue = matchedRegion ? matchedRegion.harga : 0
    const isZero = hargaValue === 0

    layer.on({
      mouseover: (e: any) => {
        const l = e.target
        l.setStyle({
          weight: isZero ? 1.5 : 2.5,
          color: isZero ? "#cbd5e1" : "#047857",
          fillOpacity: isZero ? 0.65 : 0.95,
        })
        l.bringToFront()
      },
      mouseout: (e: any) => {
        const l = e.target
        l.setStyle({
          weight: isZero ? 1 : 1.2,
          color: isZero ? "#e2e8f0" : "#065f46",
          fillOpacity: isZero ? 0.5 : 0.85,
        })
      },
    })

    layer.bindTooltip(
      `<div class="p-1.5 font-sans text-xs" style="min-width:160px">
        <strong class="text-slate-900 text-sm block border-b border-slate-200 pb-1.5 mb-1.5">${feature.properties.nama}</strong>
        <span class="text-slate-500">Harga Kedelai:</span><br/>
        <strong class="${
          isZero 
            ? "text-slate-400 font-medium" 
            : hargaValue < 11000 ? "text-rose-600" : "text-emerald-700"
        }" style="font-size:13px">
          ${!isZero ? "Rp " + hargaValue.toLocaleString("id-ID") : "Data tidak tersedia"}
        </strong>
      </div>`,
      { sticky: true, direction: "top", opacity: 0.97 }
    )
  }

  if (isLoading || (!geoJsonData && !errorGeo)) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Memuat peta spasial harga...</p>
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

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-2xl border border-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      <MapContainer
        center={[-7.75, 112.75]} 
        zoom={7.5}                 
        scrollWheelZoom={false}
        className="h-full w-full z-0 bg-[#a3c9e6]" 
      >
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`}
        />
        
        {geoJsonData && (
          <GeoJSON 
            key={`${selectedYear || ""}-${selectedMonth || ""}-${data.length}`}
            data={geoJsonData} 
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      
      {/* LEGENDA HAP */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-100 font-sans text-[10px] text-slate-700 flex flex-col gap-1.5">
        <span className="font-bold border-b border-slate-100 pb-1.5 mb-0.5 text-slate-800 text-[11px]">Harga Kedelai (Rp)</span>
        
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: '#15803d', opacity: 0.9 }}></div>
          <span>&gt; Rp 14.000 (Sangat Aman)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: '#22c55e', opacity: 0.9 }}></div>
          <span>Rp 12.500 – Rp 14.000</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: '#86efac', opacity: 0.9 }}></div>
          <span>Rp 11.000 – Rp 12.500</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: '#f97316', opacity: 0.9 }}></div>
          <span>Rp 10.500 – Rp 11.000 (Rentan)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: '#ef4444', opacity: 0.9 }}></div>
          <span className="font-semibold text-rose-600">&lt; Rp 10.500 (Kritis)</span>
        </div>
        
        <div className="flex items-center gap-2 border-t border-slate-100 pt-1.5 mt-0.5">
          <div className="w-3.5 h-3.5 rounded-sm border border-slate-200" style={{ background: '#ffffff', opacity: 0.5 }}></div>
          <span>Tidak ada data / 0</span>
        </div>
      </div>
    </div>
  )
}