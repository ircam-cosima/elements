# this prevents using plt.show() :
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

	fileName = './public/exports/models/' + sys.argv[1] + '.json'

	with open(fileName) as file:
		data = json.load(file)
	
	models = data["models"]

	# lists of indices of labels and feature dimensions to take into account
	labels = np.arange(len(models) - 3)#[0,1,2]
	features = [0,1,2]

	scatter_proxies=[]
	labels=[]

	#indices = [0,2,3]
	ncolors = len(models) #* len(models[0]["states"]) * len(models[0]["states"][0]["components"])
	colors = iter(cm.rainbow(np.linspace(0, 1, ncolors)))

	fig = plt.figure()
	ax = fig.add_subplot(111, projection="3d")

	for m in models:
		states = m["states"]
		col = next(colors)
		for s in states:
			components = s["components"]
			for c in components:
				#pprint(c["mean"])
				mean = c["mean"]
				cov = np.reshape(c["covariance"], (len(c["covariance"])/9, 9))
				a = np.random.multivariate_normal(mean, cov, 100) # distrib
			 	# ax.scatter(a[:,2], a[:,8], np.zeros(a.shape[0]), color=col, marker="o")#, depthshade=False)

			 	# ax.scatter(a[:,0], a[:,1], a[:,2], color=col, marker="o")#, depthshade=False)
			 	# ax.scatter(a[:,3], a[:,4], a[:,5], color=col, marker="o")#, depthshade=False)
			 	ax.scatter(a[:,6], a[:,7], a[:,8], color=col, marker="o")#, depthshade=False)

		proxy = lines.Line2D([0],[0], linestyle="solid", color=col)
		scatter_proxies.append(proxy)
		labels.append(m["label"])

	ax.legend(scatter_proxies, labels, numpoints=1)
	plt.show()
	# #plt.savefig("lifhjioehb.png")

main()