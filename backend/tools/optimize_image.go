package main

import (
	"fmt"
	"image"
	"image/color"
	_ "image/jpeg"
	"image/jpeg"
	"os"
)

// Simple bilinear downsampler
func resizeImage(src image.Image, targetWidth, targetHeight int) image.Image {
	srcBounds := src.Bounds()
	srcW := srcBounds.Dx()
	srcH := srcBounds.Dy()

	dst := image.NewRGBA(image.Rect(0, 0, targetWidth, targetHeight))

	for y := 0; y < targetHeight; y++ {
		for x := 0; x < targetWidth; x++ {
			srcX := int(float64(x) * float64(srcW) / float64(targetWidth))
			srcY := int(float64(y) * float64(srcH) / float64(targetHeight))
			r, g, b, a := src.At(srcBounds.Min.X+srcX, srcBounds.Min.Y+srcY).RGBA()
			dst.Set(x, y, color.RGBA64{uint16(r), uint16(g), uint16(b), uint16(a)})
		}
	}
	return dst
}

func main() {
	inputPath := "frontend/public/Hispter_Falah.jpg"
	outputPath := "frontend/public/Hispter_Falah_opt.jpg"

	file, err := os.Open(inputPath)
	if err != nil {
		fmt.Printf("Error opening file: %v\n", err)
		return
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		fmt.Printf("Error decoding image: %v\n", err)
		return
	}

	bounds := img.Bounds()
	origW := bounds.Dx()
	origH := bounds.Dy()
	fmt.Printf("Original dimensions: %dx%d\n", origW, origH)

	// Target 800 width maintaining aspect ratio
	targetW := 800
	targetH := (origH * targetW) / origW

	resized := resizeImage(img, targetW, targetH)

	outFile, err := os.Create(outputPath)
	if err != nil {
		fmt.Printf("Error creating output file: %v\n", err)
		return
	}
	defer outFile.Close()

	opt := jpeg.Options{Quality: 85}
	if err := jpeg.Encode(outFile, resized, &opt); err != nil {
		fmt.Printf("Error encoding jpeg: %v\n", err)
		return
	}

	fmt.Printf("Optimized image saved to %s (%dx%d)\n", outputPath, targetW, targetH)
}
