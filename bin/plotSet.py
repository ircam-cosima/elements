#import matplotlib
#matplotlib.use("Agg")

from mpl_toolkits.mplot3d import Axes3D
import matplotlib.lines as lines
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import numpy as np
from pprint import pprint
import sys
import json
from random import randint

def main():
	if len(sys.argv) < 2:
		print 'you need to pass a filename (without the .json extension) as an argument'
		return

	fileName = './public/exports/sets/' + sys.argv[1] + '.json';

	with open(fileName) as file:
		data = json.load(file)
	
	phrases = data["phrases"]

	scatter_proxies=[]
	labels=[]

	indices = np.arange(len(phrases))#[0,1,2]
	#indices = [0,2,3]
	colors = iter(cm.rainbow(np.linspace(0, 1, len(indices))))

	fig = plt.figure()
	ax = fig.add_subplot(111, projection="3d")
	
	#for p in phrases:
	for i in indices:
		c = next(colors)
		p = phrases[i]
		a = np.array(p["data"])
		ax.scatter(a[6::9], a[7::9], a[8::9], color=c, marker="o")
		proxy = lines.Line2D([0],[0], linestyle="solid", c=c)
		scatter_proxies.append(proxy)
		labels.append(p["label"])

	ax.legend(scatter_proxies, labels, numpoints=1)
	plt.show()
	#plt.savefig("lifhjioehb.png")

main()