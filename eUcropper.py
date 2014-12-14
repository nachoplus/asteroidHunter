#!/usr/bin/python
# -*- coding: iso-8859-15 -*-
#EETFSuit
#Category: Posprocessing

import commands,os, sys,glob

from PIL import Image,ImageDraw,ImageFont
import f2n
import copy
import numpy as np


class cropperClass:


	def loadWCSfromFits(self,fits):
		self.wcsFits=fits


	def loadImageFromFits(self,fits):
		self.fitsToCrop = f2n.fromfits(fits)


	def cropRADEC(self,ra,dec,deltaRA,deltaDEC,fichero):
		print "Generating crop from:",fits, "RA,DEC,deltas coords:",ra,dec,deltaRA,deltaDEC
		coords0=(self.wcs2pix(self.wcsFits,RA-deltaRA,DEC-deltaDEC))
		coords1=(self.wcs2pix(self.wcsFits,RA+deltaRA,DEC+deltaDEC))
		if coords0==(0,0) and coords1==(0,0):
			print "RA/DEC to x,y FAIL ",fichero," not create"
			return False
		(x0,y0)=map(lambda x:int(x),coords0)
		(x1,y1)=map(lambda x:int(x),coords0)
		return self.cropXY(self,x0,x1,y0,y1,fichero)


	def cropXY(self,x0,x1,y0,y1,fichero,negative=True):
		#Always return a image padded with black if outside limits
		#Check limits
		print "Generating crop from:",self.fitsToCrop, "x,y coords:",x0,x1,y0,y1
		xx0,xx1,yy0,yy1=x0,x1,y0,y1
		overflow=False
		x0offset=0
		x1offset=x1-x0
		y0offset=0
		y1offset=y1-y0
		if x0<0:
			xx0=0
			overflow=True
			x0offset=-x0

		if x1>self.fitsToCrop.origwidth:
			xx1=self.fitsToCrop.origwidth
			overflow=True
			x1offset=xx1-xx0

		if y0<0:
			yy0=0
			overflow=True
			y1offset=yy1-yy0


		if y1>self.fitsToCrop.origheight:
			yy1=self.fitsToCrop.origheight
			overflow=True
			y0offset=y1-yy1



		myimage = copy.deepcopy(self.fitsToCrop)
		myimage.crop(xx0,xx1,yy0,yy1)
		myimage.setzscale(z1="auto",z2="flat",samplesizelimit=10000,nsig=3)
		#myimage.setzscale(z1="auto",z2="auto",samplesizelimit=10000,nsig=3)
		#myimage.setzscale(-1000,5000)
		# z2 = "ex" means extrema -> maximum in this case.
		if negative:
			myimage.makepilimage("log", negative = True)
		else:
			myimage.makepilimage("lin")
		# We can choose to make a negative image.


		if not overflow:
			myimage.tonet(fichero)
		else:
			print "f2n overflow, Padding in black"
			box=(x0offset,y0offset,x1offset,y1offset)
			print "BOX",box
			w,h = x1-x0,y1-y0
			print "W/H",w,h
			data = np.empty( (w,h), dtype=np.uint8)
			data.fill(25)
			img = Image.fromarray(data)
			print "SIZE:",img.size
			im  = myimage.pilimage		
			img.paste(im, box)
			img.save(fichero)

	  	return True	


	def test(self):
		print "Generating PNG from:",fits
		myimage = copy.deepcopy(self.fitsToCrop)
		myimage.crop(70, 270, 60, 260)
		myimage.setzscale("auto")
		# z2 = "ex" means extrema -> maximum in this case.
		myimage.makepilimage("log", negative = True)
		# We can choose to make a negative image.
		myimage.tonet("test.png")

	def test0(self):
		self.cropXY(70, 270, 60, 260,'test1.png')
		self.cropXY(-70, 130, 60, 260,'test2.png')
		self.cropXY(70, 270, -60, 140,'test3.png')
		self.cropXY(3056-200, 3056, 3056-200, 3056,'test4.png')
		self.cropXY(3056-100, 3156, 3056-200, 3056,'test5.png')
		self.cropXY(3056-200, 3056, 3056-100, 3156,'test6.png')
		#self.cropXY(70, 270, -60, 200,'test3.png')
		#self.cropXY(70, 270, 3000, 4000,'test4.png')


def writeGif(AnimateGif, imgs, duration=0.4):
	use_convert=True
	if use_convert:
		#animategif library do not work properly
		#use ImageMagick instead
		cmd="convert -delay "+str(duration*100)+" -loop 0 "
		for im in imgs:
			cmd=cmd+im+" "
		cmd=cmd+AnimateGif
		res=commands.getoutput(cmd)
		print res
	else:
		from images2gif import writeGif
		imgsI = [Image.open(fn) for fn in imgs]
		writeGif(AnimateGif, imgsI, duration)

if __name__ == '__main__':
	fits=sys.argv[1:][0]
	cropper=cropperClass()
	cropper.loadImageFromFits(fits)
	cropper.test0()	





