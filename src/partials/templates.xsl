<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="blank-view">
	<h2>Welcome to ImAudio.</h2>

	<div class="block-buttons">
		<div class="btn" data-click="open-filesystem">
			<i class="icon-folder-open"></i>
			Open&#8230;
		</div>

		<div class="btn" data-click="from-clipboard">
			<i class="icon-clipboard"></i>
			From clipboard
		</div>
	</div>

	<div class="block-samples" data-click="select-sample">
		<h3>Samples</h3>
		<xsl:call-template name="sample-list" />
	</div>

	<xsl:if test="count(./Recents/*) &gt; 0">
		<div class="block-recent" data-click="select-recent-file">
			<h3>Recent</h3>
			<xsl:call-template name="recent-list" />
		</div>
	</xsl:if>
</xsl:template>


<xsl:template name="sample-list">
	<xsl:for-each select="./Samples/*">
		<div class="sample">
			<i>
				<xsl:attribute name="class"><xsl:value-of select="@icon"/></xsl:attribute>
			</i>
			<h4><xsl:value-of select="@name"/></h4>
			<h5><xsl:call-template name="sys:file-size">
					<xsl:with-param name="bytes" select="@sizeB" />
				</xsl:call-template> — <xsl:value-of select="@duration"/></h5>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="recent-list">
	<xsl:for-each select="./Recents/*">
		<div class="recent-file">
			<xsl:attribute name="data-file"><xsl:value-of select="@filepath"/></xsl:attribute>
			<i>
				<xsl:attribute name="class"><xsl:value-of select="@icon"/></xsl:attribute>
			</i>
			<h4><xsl:value-of select="@name"/></h4>
			<h5><xsl:call-template name="sys:file-size">
					<xsl:with-param name="bytes" select="@sizeB" />
				</xsl:call-template> — <xsl:value-of select="@duration"/></h5>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="peq-list">
	<xsl:for-each select="./*">
		<xsl:call-template name="peq-list-row" />
	</xsl:for-each>
</xsl:template>


<xsl:template name="peq-list-row">
	<div class="list-row" data-hover="peq-row">
		<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
		<div>
			<div class="type-options" data-change="set-type">
				<i data-arg="peak" class="icon-curve-peak" title="Peaking">
					<xsl:if test="@type = 'peak'"><xsl:attribute name="class">icon-curve-peak active</xsl:attribute></xsl:if>
				</i>
				<i data-arg="high" class="icon-curve-high" title="Highpass">
					<xsl:if test="@type = 'high'"><xsl:attribute name="class">icon-curve-high active</xsl:attribute></xsl:if>
				</i>
				<i data-arg="low" class="icon-curve-low" title="Lowpass">
					<xsl:if test="@type = 'low'"><xsl:attribute name="class">icon-curve-low active</xsl:attribute></xsl:if>
				</i>
			</div>
		</div>
		<div><span class="show-knob-bubble" data-change="set-gain" data-name="gain" data-min="-35" data-max="35" data-suffix=" dB"><xsl:value-of select="@gain"/> dB</span></div>
		<div><span class="show-knob-bubble" data-change="set-freq" data-name="freq" data-min="22" data-max="20000" data-suffix=" Hz"><xsl:value-of select="@freq"/> Hz</span></div>
		<div><span class="show-knob-bubble" data-change="set-q" data-name="q" data-min="1" data-max="50" data-step="0.1"><xsl:value-of select="@q"/></span></div>
		<div>
			<i class="icon-audio-on">
				<xsl:if test="@state = 'off'"><xsl:attribute name="class">icon-audio-off</xsl:attribute></xsl:if>
			</i>
			<i class="icon-trashcan"></i>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>